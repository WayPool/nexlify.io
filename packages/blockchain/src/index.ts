/**
 * @platform/blockchain
 *
 * Blockchain anchoring for immutable audit trails.
 * Implements Merkle tree batching and smart contract anchoring.
 */

import { createHash } from 'crypto';

// =============================================================================
// Types
// =============================================================================

export interface AnchorRecord {
  id: string;
  merkle_root: string;
  tx_hash: string;
  block_number: number;
  anchored_at: string;
  event_count: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface MerkleProof {
  leaf: string;
  proof: string[];
  positions: ('left' | 'right')[];
  root: string;
}

export interface VerificationResult {
  verified: boolean;
  tx_hash?: string;
  block_number?: number;
  anchored_at?: string;
  merkle_proof?: MerkleProof;
}

export interface BlockchainConfig {
  rpc_url: string;
  contract_address: string;
  private_key: string;
  chain_id: number;
  batch_size: number;
  batch_interval_ms: number;
}

// =============================================================================
// Hash Utilities
// =============================================================================

/**
 * Generate SHA-256 hash of data.
 */
export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Hash an event for anchoring.
 * Converts event to canonical JSON before hashing.
 */
export function hashEvent(event: Record<string, unknown>): string {
  const canonical = JSON.stringify(event, Object.keys(event).sort());
  return sha256(canonical);
}

/**
 * Combine two hashes (for Merkle tree).
 */
export function combineHashes(left: string, right: string): string {
  const combined = left < right ? left + right : right + left;
  return sha256(combined);
}

// =============================================================================
// Merkle Tree
// =============================================================================

export class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(hashes: string[]) {
    if (hashes.length === 0) {
      throw new Error('Cannot create Merkle tree with no leaves');
    }

    this.leaves = [...hashes];
    this.layers = this.buildLayers();
  }

  private buildLayers(): string[][] {
    const layers: string[][] = [this.leaves];

    while (layers[layers.length - 1].length > 1) {
      const currentLayer = layers[layers.length - 1];
      const nextLayer: string[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1] || left; // Duplicate if odd
        nextLayer.push(combineHashes(left, right));
      }

      layers.push(nextLayer);
    }

    return layers;
  }

  /**
   * Get the Merkle root.
   */
  getRoot(): string {
    return this.layers[this.layers.length - 1][0];
  }

  /**
   * Get proof for a leaf.
   */
  getProof(leafHash: string): MerkleProof | null {
    let index = this.leaves.indexOf(leafHash);
    if (index === -1) return null;

    const proof: string[] = [];
    const positions: ('left' | 'right')[] = [];

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
        positions.push(isRightNode ? 'left' : 'right');
      }

      index = Math.floor(index / 2);
    }

    return {
      leaf: leafHash,
      proof,
      positions,
      root: this.getRoot(),
    };
  }

  /**
   * Verify a proof.
   */
  static verifyProof(proof: MerkleProof): boolean {
    let hash = proof.leaf;

    for (let i = 0; i < proof.proof.length; i++) {
      const sibling = proof.proof[i];
      hash =
        proof.positions[i] === 'left'
          ? combineHashes(sibling, hash)
          : combineHashes(hash, sibling);
    }

    return hash === proof.root;
  }

  /**
   * Get all leaves.
   */
  getLeaves(): string[] {
    return [...this.leaves];
  }

  /**
   * Get leaf count.
   */
  getLeafCount(): number {
    return this.leaves.length;
  }
}

// =============================================================================
// Anchor Service
// =============================================================================

export interface AnchorServiceConfig {
  blockchain: BlockchainConfig;
  storage: AnchorStorage;
}

export interface AnchorStorage {
  saveAnchor(anchor: AnchorRecord): Promise<void>;
  getAnchor(id: string): Promise<AnchorRecord | null>;
  getAnchorByRoot(merkleRoot: string): Promise<AnchorRecord | null>;
  getEventAnchor(eventHash: string): Promise<{
    anchor: AnchorRecord;
    proof: MerkleProof;
  } | null>;
  saveEventMapping(eventHash: string, anchorId: string, proof: MerkleProof): Promise<void>;
}

export class AnchorService {
  private config: AnchorServiceConfig;
  private pendingEvents: Map<string, Record<string, unknown>> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(config: AnchorServiceConfig) {
    this.config = config;
  }

  /**
   * Queue an event for anchoring.
   */
  async queueEvent(event: Record<string, unknown>): Promise<string> {
    const hash = hashEvent(event);
    this.pendingEvents.set(hash, event);

    // Start batch timer if not running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(
        () => this.processBatch(),
        this.config.blockchain.batch_interval_ms
      );
    }

    // Process immediately if batch size reached
    if (this.pendingEvents.size >= this.config.blockchain.batch_size) {
      await this.processBatch();
    }

    return hash;
  }

  /**
   * Process pending batch.
   */
  async processBatch(): Promise<AnchorRecord | null> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.pendingEvents.size === 0) {
      return null;
    }

    const hashes = Array.from(this.pendingEvents.keys());
    const tree = new MerkleTree(hashes);
    const merkleRoot = tree.getRoot();

    // Create anchor record
    const anchor: AnchorRecord = {
      id: generateAnchorId(),
      merkle_root: merkleRoot,
      tx_hash: '',
      block_number: 0,
      anchored_at: new Date().toISOString(),
      event_count: hashes.length,
      status: 'pending',
    };

    // Save anchor first
    await this.config.storage.saveAnchor(anchor);

    // Save event mappings with proofs
    for (const hash of hashes) {
      const proof = tree.getProof(hash);
      if (proof) {
        await this.config.storage.saveEventMapping(hash, anchor.id, proof);
      }
    }

    // Anchor to blockchain
    try {
      const txResult = await this.anchorToBlockchain(merkleRoot);
      anchor.tx_hash = txResult.tx_hash;
      anchor.block_number = txResult.block_number;
      anchor.status = 'confirmed';
      await this.config.storage.saveAnchor(anchor);
    } catch (error) {
      anchor.status = 'failed';
      await this.config.storage.saveAnchor(anchor);
      throw error;
    }

    // Clear processed events
    this.pendingEvents.clear();

    return anchor;
  }

  /**
   * Anchor Merkle root to blockchain.
   */
  private async anchorToBlockchain(
    merkleRoot: string
  ): Promise<{ tx_hash: string; block_number: number }> {
    // This would use ethers.js to interact with the smart contract
    // For now, return mock data - actual implementation requires contract deployment

    // In production:
    // const provider = new ethers.JsonRpcProvider(this.config.blockchain.rpc_url);
    // const wallet = new ethers.Wallet(this.config.blockchain.private_key, provider);
    // const contract = new ethers.Contract(this.config.blockchain.contract_address, ABI, wallet);
    // const tx = await contract.anchor(merkleRoot);
    // const receipt = await tx.wait();
    // return { tx_hash: receipt.hash, block_number: receipt.blockNumber };

    return {
      tx_hash: `0x${sha256(merkleRoot + Date.now())}`,
      block_number: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Verify an event hash.
   */
  async verify(eventHash: string): Promise<VerificationResult> {
    const mapping = await this.config.storage.getEventAnchor(eventHash);

    if (!mapping) {
      return { verified: false };
    }

    const { anchor, proof } = mapping;

    // Verify Merkle proof
    const proofValid = MerkleTree.verifyProof(proof);
    if (!proofValid) {
      return { verified: false };
    }

    // Verify blockchain (in production, check contract)
    if (anchor.status !== 'confirmed') {
      return { verified: false };
    }

    return {
      verified: true,
      tx_hash: anchor.tx_hash,
      block_number: anchor.block_number,
      anchored_at: anchor.anchored_at,
      merkle_proof: proof,
    };
  }

  /**
   * Force flush pending events.
   */
  async flush(): Promise<AnchorRecord | null> {
    return this.processBatch();
  }

  /**
   * Get pending event count.
   */
  getPendingCount(): number {
    return this.pendingEvents.size;
  }
}

// =============================================================================
// Smart Contract ABI (for reference)
// =============================================================================

export const ANCHOR_CONTRACT_ABI = [
  {
    inputs: [{ name: 'merkleRoot', type: 'bytes32' }],
    name: 'anchor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'merkleRoot', type: 'bytes32' }],
    name: 'getAnchor',
    outputs: [
      { name: 'timestamp', type: 'uint256' },
      { name: 'blockNumber', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'merkleRoot', type: 'bytes32' }],
    name: 'isAnchored',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'merkleRoot', type: 'bytes32' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'Anchored',
    type: 'event',
  },
];

// =============================================================================
// Smart Contract Solidity (for deployment reference)
// =============================================================================

export const ANCHOR_CONTRACT_SOLIDITY = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AuditAnchor {
    struct Anchor {
        uint256 timestamp;
        uint256 blockNumber;
    }

    mapping(bytes32 => Anchor) public anchors;

    event Anchored(bytes32 indexed merkleRoot, uint256 timestamp);

    function anchor(bytes32 merkleRoot) external {
        require(anchors[merkleRoot].timestamp == 0, "Already anchored");

        anchors[merkleRoot] = Anchor({
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        emit Anchored(merkleRoot, block.timestamp);
    }

    function getAnchor(bytes32 merkleRoot) external view returns (uint256 timestamp, uint256 blockNumber) {
        Anchor memory a = anchors[merkleRoot];
        return (a.timestamp, a.blockNumber);
    }

    function isAnchored(bytes32 merkleRoot) external view returns (bool) {
        return anchors[merkleRoot].timestamp != 0;
    }
}
`;

// =============================================================================
// Utilities
// =============================================================================

function generateAnchorId(): string {
  return `anchor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a blockchain client for module SDK.
 */
export function createBlockchainClient(
  anchorService: AnchorService
): {
  hash: (data: unknown) => string;
  verify: (hash: string) => Promise<VerificationResult>;
} {
  return {
    hash: (data: unknown) => hashEvent(data as Record<string, unknown>),
    verify: (hash: string) => anchorService.verify(hash),
  };
}

// =============================================================================
// In-Memory Storage (for testing)
// =============================================================================

export class InMemoryAnchorStorage implements AnchorStorage {
  private anchors = new Map<string, AnchorRecord>();
  private anchorsByRoot = new Map<string, AnchorRecord>();
  private eventMappings = new Map<
    string,
    { anchorId: string; proof: MerkleProof }
  >();

  async saveAnchor(anchor: AnchorRecord): Promise<void> {
    this.anchors.set(anchor.id, anchor);
    this.anchorsByRoot.set(anchor.merkle_root, anchor);
  }

  async getAnchor(id: string): Promise<AnchorRecord | null> {
    return this.anchors.get(id) || null;
  }

  async getAnchorByRoot(merkleRoot: string): Promise<AnchorRecord | null> {
    return this.anchorsByRoot.get(merkleRoot) || null;
  }

  async saveEventMapping(
    eventHash: string,
    anchorId: string,
    proof: MerkleProof
  ): Promise<void> {
    this.eventMappings.set(eventHash, { anchorId, proof });
  }

  async getEventAnchor(
    eventHash: string
  ): Promise<{ anchor: AnchorRecord; proof: MerkleProof } | null> {
    const mapping = this.eventMappings.get(eventHash);
    if (!mapping) return null;

    const anchor = await this.getAnchor(mapping.anchorId);
    if (!anchor) return null;

    return { anchor, proof: mapping.proof };
  }
}
