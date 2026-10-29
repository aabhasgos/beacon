import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";
import { getStudentRichLedger } from "@/lib/agent/groq";

export const dynamic = "force-dynamic";

interface RoadmapTaskTemplate {
  title: string;
  desc: string;
  minutes: number;
  prereq: string;
  taskType: string;
  focusKey: string;
  conceptsToLearn: string;
  recruiterImpact: string;
  starterCode: string;
}

const PRESET_TRACKS: Record<string, { title: string; tasks: RoadmapTaskTemplate[] }> = {
  google: {
    title: "Google India Systems & SDE Invariant Preparation Track",
    tasks: [
      {
        title: "Rotated Array Invariant Search (Strict O(log N) Binary Search)",
        desc: "Implement search_rotated_array(nums, target) on an array rotated at an unknown pivot index. Must strictly satisfy O(log N) runtime with zero linear scans.",
        minutes: 45,
        prereq: "Algorithms & Binary Search Foundations",
        taskType: "Algorithmic Implementation",
        focusKey: "Rotated Array Pivot Detection & O(log N) Monotonic Boundary Invariant",
        conceptsToLearn: "Midpoint overflow prevention (low + (high - low) // 2), Pivot detection condition, Monotonic half-space reduction, Off-by-one boundary handling",
        recruiterImpact: "Tested directly in Google India STEP and SDE-1 algorithmic screenings to eliminate candidates relying on linear lookups.",
        starterCode: `class Solution:
    def search_rotated_array(self, nums: list[int], target: int) -> int:
        """
        Given a sorted array nums rotated at some unknown pivot, return the index of target.
        If target is not found, return -1.
        
        Constraints:
        - Time Complexity must be strictly O(log N).
        - Space Complexity must be O(1).
        """
        if not nums:
            return -1
            
        left, right = 0, len(nums) - 1
        
        while left <= right:
            mid = left + (right - left) // 2
            
            if nums[mid] == target:
                return mid
                
            # Determine which half is strictly monotonically ordered
            if nums[left] <= nums[mid]:
                # Left half is sorted
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                # Right half is sorted
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
                    
        return -1

# Verification test assertions
if __name__ == "__main__":
    sol = Solution()
    assert sol.search_rotated_array([4, 5, 6, 7, 0, 1, 2], 0) == 4
    assert sol.search_rotated_array([4, 5, 6, 7, 0, 1, 2], 3) == -1
    assert sol.search_rotated_array([1], 0) == -1
    print("✓ All invariant tests passed successfully!")
`,
      },
      {
        title: "High-Concurrency LRU Cache with O(1) Eviction & Atomic Mutex",
        desc: "Build a thread-safe Least Recently Used (LRU) Cache supporting get(key) and put(key, value) in strictly O(1) average time with double-ended linked list and mutex locks.",
        minutes: 60,
        prereq: "Hash Maps & Doubly Linked Lists",
        taskType: "Systems Architecture",
        focusKey: "O(1) Hash Map + Doubly Linked List with Reentrant Mutex Locking",
        conceptsToLearn: "Sentinel head/tail nodes, Atomic node splicing, Mutex contention minimization, Cache eviction invariant",
        recruiterImpact: "Evaluated in Google Systems and Distributed Caching interviews to verify production-grade concurrency competence.",
        starterCode: `import threading

class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class ThreadSafeLRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head
        self.lock = threading.Lock()

    def _remove(self, node: Node):
        prev_node = node.prev
        next_node = node.next
        prev_node.next = next_node
        next_node.prev = prev_node

    def _add_to_front(self, node: Node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        with self.lock:
            if key not in self.cache:
                return -1
            node = self.cache[key]
            self._remove(node)
            self._add_to_front(node)
            return node.value

    def put(self, key: int, value: int) -> None:
        with self.lock:
            if key in self.cache:
                self._remove(self.cache[key])
            node = Node(key, value)
            self._add_to_front(node)
            self.cache[key] = node
            if len(self.cache) > self.capacity:
                lru = self.tail.prev
                self._remove(lru)
                del self.cache[lru.key]
`,
      },
      {
        title: "Inverted Index Search Engine & BM25 Term Relevance Scorer",
        desc: "Implement a tokenized inverted index that parses document text, tracks document frequencies, and ranks query results using the BM25 probabilistic relevance formula.",
        minutes: 60,
        prereq: "Information Retrieval & Hash Structures",
        taskType: "Information Retrieval",
        focusKey: "Inverted Index Postings List Intersection & BM25 Score Computation",
        conceptsToLearn: "Term Frequency (TF), Inverse Document Frequency (IDF), Document length normalization (b=0.75, k1=1.2), Postings list skip pointers",
        recruiterImpact: "Required competency for Google Search, Query Understanding, and large-scale data retrieval roles.",
        starterCode: `import math
from collections import defaultdict

class InvertedIndexEngine:
    def __init__(self, k1: float = 1.2, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.docs = {}
        self.postings = defaultdict(dict)  # term -> {doc_id: term_freq}
        self.avg_doc_len = 0.0

    def add_document(self, doc_id: str, text: str):
        tokens = text.lower().split()
        self.docs[doc_id] = len(tokens)
        self.avg_doc_len = sum(self.docs.values()) / len(self.docs)
        for t in tokens:
            self.postings[t][doc_id] = self.postings[t].get(doc_id, 0) + 1

    def search(self, query: str) -> list[tuple[str, float]]:
        """
        Rank matching documents using BM25 relevance score.
        """
        q_tokens = query.lower().split()
        scores = defaultdict(float)
        N = len(self.docs)
        
        for term in q_tokens:
            if term not in self.postings:
                continue
            df = len(self.postings[term])
            idf = math.log((N - df + 0.5) / (df + 0.5) + 1.0)
            for doc_id, tf in self.postings[term].items():
                doc_len = self.docs[doc_id]
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1 - self.b + self.b * (doc_len / self.avg_doc_len))
                scores[doc_id] += idf * (numerator / denominator)
                
        return sorted(scores.items(), key=lambda x: x[1], reverse=True)
`,
      },
      {
        title: "Cryptographic SHA-256 Merkle Provenance Stamping",
        desc: "Package your three verified code solutions, compute individual SHA-256 hashes, generate a root Merkle hash, and stamp proof to the Beacon ledger.",
        minutes: 30,
        prereq: "Cryptography & Hash Functions",
        taskType: "Ledger Verification",
        focusKey: "SHA-256 Merkle Root Provenance & Immutable Recruiter Audit Hash",
        conceptsToLearn: "Cryptographic digests, Pairwise leaf hashing, Tamper-evident data structures, DPDP 2025 verifiable audit trail",
        recruiterImpact: "Proves to enterprise talent radar that your code solutions were genuinely authored and cryptographically verified on-chain/ledger.",
        starterCode: `import hashlib

def hash_data(data: str) -> str:
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def compute_merkle_root(leaf_hashes: list[str]) -> str:
    """
    Compute pairwise Merkle root hash for verified code artifacts.
    """
    if not leaf_hashes:
        return ""
    current = leaf_hashes[:]
    while len(current) > 1:
        if len(current) % 2 != 0:
            current.append(current[-1])
        next_level = []
        for i in range(0, len(current), 2):
            combined = current[i] + current[i+1]
            next_level.append(hash_data(combined))
        current = next_level
    return current[0]
`,
      },
    ],
  },
  razorpay: {
    title: "Razorpay Core Payments Platform & Concurrency Task Track",
    tasks: [
      {
        title: "Idempotent Payment Processor with Distributed Redis SETNX Locking",
        desc: "Implement process_payment_charge(idempotency_key, amount_inr, customer_id). Guarantee zero duplicate charges under concurrent client retries.",
        minutes: 60,
        prereq: "REST APIs & Distributed Locking",
        taskType: "High-Concurrency Payments",
        focusKey: "Atomic SETNX Distributed Locking with TTL & Duplicate Elimination",
        conceptsToLearn: "UUIDv4 Idempotency-Key headers, Redis SETNX atomic acquire/release, In-flight duplicate detection, Idempotent response replay",
        recruiterImpact: "The primary criteria tested by Razorpay Infrastructure, Swiggy, and Flipkart to prevent financial double-spending.",
        starterCode: `import time
import uuid

class InMemoryRedisMock:
    def __init__(self):
        self.store = {}
        self.locks = {}

    def setnx(self, key: str, val: str, ttl: int = 10) -> bool:
        now = time.time()
        if key in self.locks and self.locks[key] > now:
            return False
        self.locks[key] = now + ttl
        return True

    def delete(self, key: str):
        self.locks.pop(key, None)

    def get(self, key: str):
        return self.store.get(key)

    def set(self, key: str, val: dict):
        self.store[key] = val

class PaymentTransactionService:
    def __init__(self, cache_client):
        self.cache = cache_client

    def process_charge(self, idempotency_key: str, amount_inr: int, customer_id: str) -> dict:
        """
        Process charge safely. If idempotency_key was already processed, return stored result.
        """
        lock_key = f"lock:charge:{idempotency_key}"
        record_key = f"record:charge:{idempotency_key}"

        # 1. Check existing record
        existing = self.cache.get(record_key)
        if existing:
            return {"status": "SUCCESS", "source": "IDEMPOTENT_CACHE", "transaction": existing}

        # 2. Acquire atomic lock
        acquired = self.cache.setnx(lock_key, "PROCESSING", ttl=10)
        if not acquired:
            raise RuntimeError("Concurrent transaction in flight with identical idempotency key.")

        try:
            # Simulate database payment transaction
            tx_payload = {
                "tx_id": f"TXN_{uuid.uuid4().hex[:10].upper()}",
                "customer_id": customer_id,
                "amount": amount_inr,
                "status": "CAPTURED",
                "timestamp": time.time(),
            }
            self.cache.set(record_key, tx_payload)
            return {"status": "SUCCESS", "source": "EXECUTED", "transaction": tx_payload}
        finally:
            self.cache.delete(lock_key)
`,
      },
      {
        title: "Double-Entry Ledger Engine with ACID Balance Invariant",
        desc: "Implement a financial double-entry bookkeeping engine where every transaction consists of balanced debits and credits totaling zero.",
        minutes: 45,
        prereq: "Database Transactions & Accounting Invariants",
        taskType: "Financial Ledger Architecture",
        focusKey: "Double-Entry Zero-Sum Debit/Credit Balance Invariant",
        conceptsToLearn: "Sum(Debits) == Sum(Credits), Atomic multi-account updates, Overdraft prevention, Ledger immutable audit log",
        recruiterImpact: "Core requirement for fintech backend engineering at Razorpay, Cred, and Stripe.",
        starterCode: `class DoubleEntryLedger:
    def __init__(self):
        self.accounts = {}  # account_id -> balance_inr
        self.journal = []

    def create_account(self, account_id: str, initial_balance: int = 0):
        self.accounts[account_id] = initial_balance

    def post_entry(self, entry_id: str, debits: dict[str, int], credits: dict[str, int]) -> bool:
        """
        Post a balanced financial entry. Total debits must equal total credits.
        """
        total_debit = sum(debits.values())
        total_credit = sum(credits.values())
        
        if total_debit != total_credit:
            raise ValueError(f"Imbalanced entry: Debits={total_debit}, Credits={total_credit}")
            
        # Verify no account overdraws
        for acc, amt in credits.items():
            if self.accounts.get(acc, 0) < amt:
                raise ValueError(f"Insufficient funds in account {acc}")

        # Execute atomic transfer
        for acc, amt in credits.items():
            self.accounts[acc] -= amt
        for acc, amt in debits.items():
            self.accounts[acc] = self.accounts.get(acc, 0) + amt

        self.journal.append({"entry_id": entry_id, "debits": debits, "credits": credits})
        return True
`,
      },
      {
        title: "Token Bucket Rate Limiter with Atomic Refill Interval",
        desc: "Implement a thread-safe Token Bucket rate limiter that throttles API traffic to N requests per second with burst capacity.",
        minutes: 45,
        prereq: "Concurrency & Queueing Theory",
        taskType: "Traffic Engineering",
        focusKey: "Token Bucket Millisecond Refill Rate & Burst Bound Invariant",
        conceptsToLearn: "Refill rate math (elapsed * rate), Bucket capacity ceiling, HTTP 429 Too Many Requests response headers, Mutex synchronization",
        recruiterImpact: "Evaluated in API gateway and traffic management engineering interviews at Razorpay and Uber.",
        starterCode: `import time
import threading

class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.tokens = float(capacity)
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def allow_request(self, tokens_needed: int = 1) -> bool:
        with self.lock:
            now = time.time()
            elapsed = now - self.last_refill
            # Refill tokens up to maximum capacity
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
            self.last_refill = now

            if self.tokens >= tokens_needed:
                self.tokens -= tokens_needed
                return True
            return False
`,
      },
      {
        title: "Webhook Dispatcher with Exponential Backoff & Jitter",
        desc: "Build an event dispatcher that pushes payment webhooks to merchant endpoints with 3-attempt exponential backoff, jitter, and dead-letter queueing.",
        minutes: 45,
        prereq: "Asynchronous I/O & Networking",
        taskType: "Event-Driven Systems",
        focusKey: "Exponential Backoff (2^n) with Full Jitter & Dead-Letter Isolation",
        conceptsToLearn: "Backoff = min(max_backoff, base * 2^attempt + random_jitter), HMAC-SHA256 signature header, Dead-letter queues (DLQ)",
        recruiterImpact: "Directly mirrors the webhook delivery pipeline at Razorpay and Stripe.",
        starterCode: `import time
import random
import hmac
import hashlib

def calculate_backoff(attempt: int, base: float = 0.5, cap: float = 8.0) -> float:
    temp = min(cap, base * (2 ** attempt))
    return random.uniform(0, temp)

def generate_webhook_signature(secret_key: str, payload_bytes: bytes) -> str:
    return hmac.new(secret_key.encode('utf-8'), payload_bytes, hashlib.sha256).hexdigest()
`,
      },
    ],
  },
  isro: {
    title: "ISRO Space Applications: Binary Telemetry & Packet Framing Track",
    tasks: [
      {
        title: "Binary Telemetry Frame Sync Word (0xEB90) & Header De-framing",
        desc: "Implement a binary stream parser that scans raw byte buffers for the 2-byte synchronization preamble 0xEB90 and unpacks header fields.",
        minutes: 45,
        prereq: "Binary Buffers & Bit Shifting",
        taskType: "Low-Level Systems",
        focusKey: "Bitwise Preable Synchronization (0xEB90) & Frame Boundary Invariant",
        conceptsToLearn: "Preamble search, Bit shifting (<<, >>), Masking (& 0xFF), Big-Endian struct unpacking, Buffer alignment",
        recruiterImpact: "Directly evaluated for ISRO SAC Satellite Telemetry, Ground Station data ingest, and aerospace firmware roles.",
        starterCode: `import struct

SYNC_PREAMBLE = 0xEB90

def extract_next_telemetry_frame(byte_stream: bytes) -> tuple[dict, bytes]:
    """
    Find 0xEB90 sync word in byte stream, extract 16-byte packet frame, return (packet_dict, remaining_stream).
    Frame Layout:
    - 2 bytes: Sync (0xEB90)
    - 2 bytes: Subsystem ID
    - 4 bytes: Unix Timestamp (uint32)
    - 4 bytes: Altitude Float (float32)
    - 2 bytes: Packet Length
    - 2 bytes: Checksum (CRC-16)
    """
    sync_idx = byte_stream.find(b'\\xeb\\x90')
    if sync_idx == -1 or len(byte_stream) - sync_idx < 16:
        return None, byte_stream
        
    frame_bytes = byte_stream[sync_idx:sync_idx+16]
    sync, subsys, ts, alt, length, crc = struct.unpack(">HHIfHH", frame_bytes)
    
    packet = {
        "subsystem_id": subsys,
        "timestamp": ts,
        "altitude_km": round(alt, 3),
        "payload_length": length,
        "crc": crc,
    }
    return packet, byte_stream[sync_idx+16:]
`,
      },
      {
        title: "Bitwise Packet Checksum Verification (CRC-32 & XOR Parity)",
        desc: "Implement a hardware-style bitwise CRC-32 checksum calculation to verify that satellite telemetry frames were transmitted without radiation bit-flips.",
        minutes: 45,
        prereq: "Bit Manipulation & Polynomial Division",
        taskType: "Error Detection Coding",
        focusKey: "Polynomial Division Bitwise XOR & CRC-32 Zero-Error Invariant",
        conceptsToLearn: "Polynomial 0xEDB88320, Bit inversion, XOR parity accumulation, Frame bit-flip rejection",
        recruiterImpact: "Tested by ISRO, DRDO, and aerospace avionics divisions for satellite communication safety.",
        starterCode: `def calculate_crc32(data: bytes) -> int:
    crc = 0xFFFFFFFF
    for b in data:
        crc ^= b
        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ 0xEDB88320
            else:
                crc >>= 1
    return crc ^ 0xFFFFFFFF
`,
      },
      {
        title: "Real-Time Sensor Stream Windowing & Orbit Anomaly Detector",
        desc: "Build a streaming sliding-window anomaly detector that tracks satellite gyroscopic angular velocity and flags attitude drift exceeding 3 standard deviations.",
        minutes: 45,
        prereq: "Streaming Statistics & Circular Buffers",
        taskType: "Real-Time Telemetry Analytics",
        focusKey: "Sliding Window Mean & Standard Deviation (Welford's Algorithm)",
        conceptsToLearn: "Circular ring buffers, Online variance calculation (Welford's algorithm), Z-score outlier detection (> 3 sigma)",
        recruiterImpact: "Required for aerospace flight dynamics and real-time attitude control software.",
        starterCode: `class TelemetryWindowAnomalyDetector:
    def __init__(self, window_size: int = 50, z_threshold: float = 3.0):
        self.window_size = window_size
        self.threshold = z_threshold
        self.values = []

    def ingest_reading(self, reading: float) -> bool:
        """
        Ingest altitude or gyro reading. Return True if anomaly detected.
        """
        self.values.append(reading)
        if len(self.values) > self.window_size:
            self.values.pop(0)

        if len(self.values) < 10:
            return False

        mean = sum(self.values) / len(self.values)
        variance = sum((x - mean) ** 2 for x in self.values) / len(self.values)
        std_dev = variance ** 0.5

        if std_dev == 0:
            return False

        z_score = abs(reading - mean) / std_dev
        return z_score > self.threshold
`,
      },
      {
        title: "Ground Station Pass Scheduler & Ephemeris Horizon Validator",
        desc: "Implement a visibility window calculator that computes when a low-earth orbit (LEO) satellite is elevated >= 15 degrees above the ground station horizon.",
        minutes: 45,
        prereq: "Geodesy & Trigonometric Horizon Math",
        taskType: "Astrodynamics & Ground Systems",
        focusKey: "Minimum Elevation Angle (>= 15 deg) & Pass Window Boundary Invariant",
        conceptsToLearn: "Azimuth and Elevation spherical coordinates, Line-of-sight contact window, Radio horizon obstruction",
        recruiterImpact: "Core software specification for ISRO ISTRAC ground stations and satellite mission planning.",
        starterCode: `import math

def is_satellite_visible(station_lat: float, station_lon: float, sat_lat: float, sat_lon: float, sat_alt_km: float, min_elevation_deg: float = 15.0) -> bool:
    """
    Determine if satellite is visible above the station horizon.
    Earth radius approx 6371 km.
    """
    R_earth = 6371.0
    d_lat = math.radians(sat_lat - station_lat)
    d_lon = math.radians(sat_lon - station_lon)
    lat1 = math.radians(station_lat)
    lat2 = math.radians(sat_lat)

    a = math.sin(d_lat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(d_lon/2)**2
    central_angle = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    slant_range = math.sqrt(R_earth**2 + (R_earth + sat_alt_km)**2 - 2 * R_earth * (R_earth + sat_alt_km) * math.cos(central_angle))
    cos_elevation = ((R_earth + sat_alt_km) * math.sin(central_angle)) / slant_range
    elevation_rad = math.asin(min(1.0, max(-1.0, cos_elevation)))

    return math.degrees(elevation_rad) >= min_elevation_deg
`,
      },
    ],
  },
  sih: {
    title: "Smart India Hackathon (SIH 2026): Edge-AI & Offline Sync Architecture",
    tasks: [
      {
        title: "Offline-First Sync Queue & CRDT Conflict Resolution Engine",
        desc: "Implement an opportunistic local-first queue that records field updates in SQLite while disconnected and merges changes with server state without overwriting mutations.",
        minutes: 60,
        prereq: "Distributed Consensus & CRDTs",
        taskType: "Offline-First Mobile Architecture",
        focusKey: "Last-Write-Wins (LWW) with Vector Clocks & Non-Conflicting Merges",
        conceptsToLearn: "Vector clocks, CRDT State-based vs Operation-based replication, Network partition tolerance (CAP theorem AP mode)",
        recruiterImpact: "A mandatory technical differentiator for winning Smart India Hackathon central ministry problem statements in rural zones.",
        starterCode: `import time

class LWWRegister:
    def __init__(self, key: str, value: any, timestamp: float, client_id: str):
        self.key = key
        self.value = value
        self.timestamp = timestamp
        self.client_id = client_id

class OfflineSyncQueue:
    def __init__(self, client_id: str):
        self.client_id = client_id
        self.local_state = {}
        self.pending_mutations = []

    def set_local(self, key: str, value: any):
        ts = time.time()
        reg = LWWRegister(key, value, ts, self.client_id)
        self.local_state[key] = reg
        self.pending_mutations.append(reg)

    def reconcile_with_server(self, server_state: dict[str, LWWRegister]) -> dict[str, any]:
        """
        Merge server state and local state using Last-Write-Wins rule.
        """
        for key, server_reg in server_state.items():
            if key not in self.local_state or server_reg.timestamp > self.local_state[key].timestamp:
                self.local_state[key] = server_reg
        self.pending_mutations.clear()
        return {k: v.value for k, v in self.local_state.items()}
`,
      },
      {
        title: "Tamper-Evident Merkle State Root for Offline Inspection Audits",
        desc: "Generate a cryptographic Merkle root hash across localized inspection records to prove to government auditors that offline agricultural records were not altered.",
        minutes: 45,
        prereq: "Cryptographic Hashing",
        taskType: "Government Data Integrity",
        focusKey: "SHA-256 Merkle Inclusion Proofs & Zero-Knowledge Verification",
        conceptsToLearn: "Binary Merkle tree construction, Audit proof verification, Immutable government ledger verification",
        recruiterImpact: "Evaluated by AICTE jury members to ensure hackathon software is tamper-proof for enterprise deployment.",
        starterCode: `import hashlib

def sha256_hex(val: str) -> str:
    return hashlib.sha256(val.encode('utf-8')).hexdigest()

def build_merkle_tree(records: list[str]) -> str:
    if not records:
        return ""
    nodes = [sha256_hex(r) for r in records]
    while len(nodes) > 1:
        if len(nodes) % 2 != 0:
            nodes.append(nodes[-1])
        nodes = [sha256_hex(nodes[i] + nodes[i+1]) for i in range(0, len(nodes), 2)]
    return nodes[0]
`,
      },
      {
        title: "Quantized Edge-AI Inference Pipeline (ONNX Runtime Sub-50ms)",
        desc: "Implement a lightweight model inference pipeline that loads quantized INT8 weights, processes sensor image arrays, and returns classification predictions in < 50ms.",
        minutes: 45,
        prereq: "Model Quantization & Tensor Shapes",
        taskType: "Edge AI & Computer Vision",
        focusKey: "INT8 Quantization & Sub-50ms Inference Latency Constraint",
        conceptsToLearn: "Weight quantization (FP32 -> INT8), Tensor normalization (mean=[0.485, 0.456, 0.406]), Softmax probability distribution",
        recruiterImpact: "Primary requirement for smart edge devices in Ministry of Agriculture and Defense challenges.",
        starterCode: `import math

def softmax(logits: list[float]) -> list[float]:
    max_logit = max(logits)
    exps = [math.exp(x - max_logit) for x in logits]
    total = sum(exps)
    return [round(e / total, 4) for e in exps]

def simulate_edge_inference(tensor_input: list[float]) -> dict:
    """
    Simulate sub-50ms quantized inference on low-power device.
    """
    mock_weights = [0.15, -0.22, 0.88, 0.04, -0.11]
    dot_product = sum(a * b for a, b in zip(tensor_input[:5], mock_weights))
    logits = [dot_product * 1.2, dot_product * -0.8, dot_product * 0.3]
    probs = softmax(logits)
    return {"class_id": probs.index(max(probs)), "confidence": max(probs), "latency_ms": 32}
`,
      },
      {
        title: "System Decomposition Spec & Live Proof Verification Brief",
        desc: "Author an architectural milestone brief covering offline sync queues, edge inference, and ledger hashes for SIH jury and corporate recruiter review.",
        minutes: 30,
        prereq: "System Design & Architecture",
        taskType: "System Architecture Specification",
        focusKey: "System Decomposition Spec & Live Proof Verification (SIH 2026)",
        conceptsToLearn: "C4 Architecture diagram notation, Edge caching, Database replication topology, Offline-first mobile synchronization",
        recruiterImpact: "Demonstrates institutional system design clarity to enterprise recruiters and national hackathon evaluators.",
        starterCode: `# System Architecture Specification: Smart India Hackathon (SIH 2026)

## 1. Problem Statement & Problem ID
- Problem ID: SIH-2026-MIN-089
- Title: AI-Powered Geospatial Crop Health & Ground Water Telemetry

## 2. Core Architectural Components
- Client Layer: Flutter Mobile App with offline SQLite local queue
- API Gateway: Fastify / Next.js Node.js server with JWT cryptographic signatures
- Inference Engine: PyTorch Lightweight ResNet-18 model quantized for ONNX Runtime
- Telemetry Store: PostgreSQL with PostGIS extension for spatial queries

## 3. High-Leverage Differentiator
- Works in 2G / zero-connectivity rural zones via intermittent opportunistic sync
- Proof-of-work artifact validated and ledger-hashed on Beacon OS
`,
      },
    ],
  },
};

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { targetMilestone, timeframeWeeks, trackKey } = body;

    const ledger = getStudentRichLedger(user.id);

    // Determine which track to load
    let selectedPreset = PRESET_TRACKS["google"];
    if (trackKey && PRESET_TRACKS[trackKey]) {
      selectedPreset = PRESET_TRACKS[trackKey];
    } else if (targetMilestone) {
      const lower = targetMilestone.toLowerCase();
      if (lower.includes("razorpay") || lower.includes("payment") || lower.includes("concurrency")) {
        selectedPreset = PRESET_TRACKS["razorpay"];
      } else if (lower.includes("isro") || lower.includes("space") || lower.includes("telemetry")) {
        selectedPreset = PRESET_TRACKS["isro"];
      } else if (lower.includes("hackathon") || lower.includes("sih") || lower.includes("smart india")) {
        selectedPreset = PRESET_TRACKS["sih"];
      } else {
        selectedPreset = PRESET_TRACKS["google"];
      }
    }

    const goalTitle = targetMilestone || selectedPreset.title;
    const targetDate = new Date(Date.now() + (timeframeWeeks || 12) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Archive or remove existing active tasks to give a clean, relevant roadmap
    db.prepare("DELETE FROM learning_tasks WHERE user_id = ?").run(user.id);
    db.prepare("DELETE FROM goals WHERE user_id = ?").run(user.id);

    // Insert new goal
    const goalId = `goal_${Date.now()}`;
    db.prepare(`
      INSERT INTO goals (id, user_id, title, category, target_date, status, progress, reasoning)
      VALUES (?, ?, ?, 'Technical Task Preparation', ?, 'active', 0, ?)
    `).run(
      goalId,
      user.id,
      goalTitle,
      targetDate,
      `Interactive technical task preparation track calibrated for ${ledger.fullName}.`
    );

    // Insert rich tasks
    const insertTask = db.prepare(`
      INSERT INTO learning_tasks (
        id, user_id, goal_id, title, description, estimated_minutes, prerequisite, status, order_index,
        task_type, focus_key, concepts_to_learn, recruiter_impact, starter_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?, ?)
    `);

    let order = 0;
    for (const t of selectedPreset.tasks) {
      insertTask.run(
        `tsk_${Date.now()}_${order}`,
        user.id,
        goalId,
        t.title,
        t.desc,
        t.minutes || 45,
        t.prereq || null,
        order++,
        t.taskType,
        t.focusKey,
        t.conceptsToLearn,
        t.recruiterImpact,
        t.starterCode
      );
    }

    // Telemetry event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      user.id,
      "roadmap_generated",
      `Technical Task Roadmap Active: ${goalTitle}`,
      `Generated 4 hands-on engineering challenges with live workbenches and invariant evaluations.`,
      JSON.stringify({ goalId, title: goalTitle, count: selectedPreset.tasks.length })
    );

    return NextResponse.json({
      success: true,
      goalId,
      title: goalTitle,
      taskCount: selectedPreset.tasks.length,
      message: "Technical task roadmap calibrated and loaded to your ledger.",
    });
  } catch (err: any) {
    console.error("Roadmap generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
