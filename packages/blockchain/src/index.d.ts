/**
 * @platform/blockchain
 *
 * Blockchain anchoring for immutable audit trails.
 * Implements Merkle tree batching and smart contract anchoring.
 */
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
/**
 * Generate SHA-256 hash of data.
 */
export declare function sha256(data: string | Buffer): string;
/**
 * Hash an event for anchoring.
 * Converts event to canonical JSON before hashing.
 */
export declare function hashEvent(event: Record<string, unknown>): string;
/**
 * Combine two hashes (for Merkle tree).
 */
export declare function combineHashes(left: string, right: string): string;
export declare class MerkleTree {
    private leaves;
    private layers;
    constructor(hashes: string[]);
    private buildLayers;
    /**
     * Get the Merkle root.
     */
    getRoot(): string;
    /**
     * Get proof for a leaf.
     */
    getProof(leafHash: string): MerkleProof | null;
    /**
     * Verify a proof.
     */
    static verifyProof(proof: MerkleProof): boolean;
    /**
     * Get all leaves.
     */
    getLeaves(): string[];
    /**
     * Get leaf count.
     */
    getLeafCount(): number;
}
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
export declare class AnchorService {
    private config;
    private pendingEvents;
    private batchTimer;
    constructor(config: AnchorServiceConfig);
    /**
     * Queue an event for anchoring.
     */
    queueEvent(event: Record<string, unknown>): Promise<string>;
    /**
     * Process pending batch.
     */
    processBatch(): Promise<AnchorRecord | null>;
    /**
     * Anchor Merkle root to blockchain.
     */
    private anchorToBlockchain;
    /**
     * Verify an event hash.
     */
    verify(eventHash: string): Promise<VerificationResult>;
    /**
     * Force flush pending events.
     */
    flush(): Promise<AnchorRecord | null>;
    /**
     * Get pending event count.
     */
    getPendingCount(): number;
}
export declare const ANCHOR_CONTRACT_ABI: ({
    inputs: {
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: never;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    outputs?: never;
    stateMutability?: never;
})[];
export declare const ANCHOR_CONTRACT_SOLIDITY = "\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract AuditAnchor {\n    struct Anchor {\n        uint256 timestamp;\n        uint256 blockNumber;\n    }\n\n    mapping(bytes32 => Anchor) public anchors;\n\n    event Anchored(bytes32 indexed merkleRoot, uint256 timestamp);\n\n    function anchor(bytes32 merkleRoot) external {\n        require(anchors[merkleRoot].timestamp == 0, \"Already anchored\");\n\n        anchors[merkleRoot] = Anchor({\n            timestamp: block.timestamp,\n            blockNumber: block.number\n        });\n\n        emit Anchored(merkleRoot, block.timestamp);\n    }\n\n    function getAnchor(bytes32 merkleRoot) external view returns (uint256 timestamp, uint256 blockNumber) {\n        Anchor memory a = anchors[merkleRoot];\n        return (a.timestamp, a.blockNumber);\n    }\n\n    function isAnchored(bytes32 merkleRoot) external view returns (bool) {\n        return anchors[merkleRoot].timestamp != 0;\n    }\n}\n";
/**
 * Create a blockchain client for module SDK.
 */
export declare function createBlockchainClient(anchorService: AnchorService): {
    hash: (data: unknown) => string;
    verify: (hash: string) => Promise<VerificationResult>;
};
export declare class InMemoryAnchorStorage implements AnchorStorage {
    private anchors;
    private anchorsByRoot;
    private eventMappings;
    saveAnchor(anchor: AnchorRecord): Promise<void>;
    getAnchor(id: string): Promise<AnchorRecord | null>;
    getAnchorByRoot(merkleRoot: string): Promise<AnchorRecord | null>;
    saveEventMapping(eventHash: string, anchorId: string, proof: MerkleProof): Promise<void>;
    getEventAnchor(eventHash: string): Promise<{
        anchor: AnchorRecord;
        proof: MerkleProof;
    } | null>;
}
//# sourceMappingURL=index.d.ts.map