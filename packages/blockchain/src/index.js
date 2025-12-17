"use strict";
/**
 * @platform/blockchain
 *
 * Blockchain anchoring for immutable audit trails.
 * Implements Merkle tree batching and smart contract anchoring.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAnchorStorage = exports.ANCHOR_CONTRACT_SOLIDITY = exports.ANCHOR_CONTRACT_ABI = exports.AnchorService = exports.MerkleTree = void 0;
exports.sha256 = sha256;
exports.hashEvent = hashEvent;
exports.combineHashes = combineHashes;
exports.createBlockchainClient = createBlockchainClient;
const crypto_1 = require("crypto");
// =============================================================================
// Hash Utilities
// =============================================================================
/**
 * Generate SHA-256 hash of data.
 */
function sha256(data) {
    return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
}
/**
 * Hash an event for anchoring.
 * Converts event to canonical JSON before hashing.
 */
function hashEvent(event) {
    const canonical = JSON.stringify(event, Object.keys(event).sort());
    return sha256(canonical);
}
/**
 * Combine two hashes (for Merkle tree).
 */
function combineHashes(left, right) {
    const combined = left < right ? left + right : right + left;
    return sha256(combined);
}
// =============================================================================
// Merkle Tree
// =============================================================================
class MerkleTree {
    leaves;
    layers;
    constructor(hashes) {
        if (hashes.length === 0) {
            throw new Error('Cannot create Merkle tree with no leaves');
        }
        this.leaves = [...hashes];
        this.layers = this.buildLayers();
    }
    buildLayers() {
        const layers = [this.leaves];
        while (layers[layers.length - 1].length > 1) {
            const currentLayer = layers[layers.length - 1];
            const nextLayer = [];
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
    getRoot() {
        return this.layers[this.layers.length - 1][0];
    }
    /**
     * Get proof for a leaf.
     */
    getProof(leafHash) {
        let index = this.leaves.indexOf(leafHash);
        if (index === -1)
            return null;
        const proof = [];
        const positions = [];
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
    static verifyProof(proof) {
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
    getLeaves() {
        return [...this.leaves];
    }
    /**
     * Get leaf count.
     */
    getLeafCount() {
        return this.leaves.length;
    }
}
exports.MerkleTree = MerkleTree;
class AnchorService {
    config;
    pendingEvents = new Map();
    batchTimer = null;
    constructor(config) {
        this.config = config;
    }
    /**
     * Queue an event for anchoring.
     */
    async queueEvent(event) {
        const hash = hashEvent(event);
        this.pendingEvents.set(hash, event);
        // Start batch timer if not running
        if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => this.processBatch(), this.config.blockchain.batch_interval_ms);
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
    async processBatch() {
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
        const anchor = {
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
        }
        catch (error) {
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
    async anchorToBlockchain(merkleRoot) {
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
    async verify(eventHash) {
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
    async flush() {
        return this.processBatch();
    }
    /**
     * Get pending event count.
     */
    getPendingCount() {
        return this.pendingEvents.size;
    }
}
exports.AnchorService = AnchorService;
// =============================================================================
// Smart Contract ABI (for reference)
// =============================================================================
exports.ANCHOR_CONTRACT_ABI = [
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
exports.ANCHOR_CONTRACT_SOLIDITY = `
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
function generateAnchorId() {
    return `anchor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * Create a blockchain client for module SDK.
 */
function createBlockchainClient(anchorService) {
    return {
        hash: (data) => hashEvent(data),
        verify: (hash) => anchorService.verify(hash),
    };
}
// =============================================================================
// In-Memory Storage (for testing)
// =============================================================================
class InMemoryAnchorStorage {
    anchors = new Map();
    anchorsByRoot = new Map();
    eventMappings = new Map();
    async saveAnchor(anchor) {
        this.anchors.set(anchor.id, anchor);
        this.anchorsByRoot.set(anchor.merkle_root, anchor);
    }
    async getAnchor(id) {
        return this.anchors.get(id) || null;
    }
    async getAnchorByRoot(merkleRoot) {
        return this.anchorsByRoot.get(merkleRoot) || null;
    }
    async saveEventMapping(eventHash, anchorId, proof) {
        this.eventMappings.set(eventHash, { anchorId, proof });
    }
    async getEventAnchor(eventHash) {
        const mapping = this.eventMappings.get(eventHash);
        if (!mapping)
            return null;
        const anchor = await this.getAnchor(mapping.anchorId);
        if (!anchor)
            return null;
        return { anchor, proof: mapping.proof };
    }
}
exports.InMemoryAnchorStorage = InMemoryAnchorStorage;
//# sourceMappingURL=index.js.map