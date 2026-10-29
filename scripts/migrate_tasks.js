const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'beacon.db');
const db = new Database(dbPath);

try { db.exec('ALTER TABLE learning_tasks ADD COLUMN submission_code TEXT;'); } catch (e) {}
try { db.exec('ALTER TABLE learning_tasks ADD COLUMN focus_key TEXT;'); } catch (e) {}
try { db.exec('ALTER TABLE learning_tasks ADD COLUMN concepts_to_learn TEXT;'); } catch (e) {}
try { db.exec('ALTER TABLE learning_tasks ADD COLUMN starter_code TEXT;'); } catch (e) {}
try { db.exec('ALTER TABLE learning_tasks ADD COLUMN evaluation_score INTEGER;'); } catch (e) {}
try { db.exec('ALTER TABLE learning_tasks ADD COLUMN evaluation_feedback TEXT;'); } catch (e) {}
try { db.exec('ALTER TABLE learning_tasks ADD COLUMN task_type TEXT;'); } catch (e) {}

// Task 1: Algorithmic Implementation (Google STEP / Amazon / LeetCode target)
db.prepare(`
  UPDATE learning_tasks
  SET 
    task_type = 'Algorithmic Implementation',
    focus_key = 'Binary Search Boundary Invariants & O(log N) Complexity',
    concepts_to_learn = 'Midpoint calculation without 32-bit overflow (low + (high - low) // 2), Rotated array pivot detection, Invariant boundary narrowing',
    starter_code = 'class Solution:\n    def search_rotated_array(self, nums: list[int], target: int) -> int:\n        \"\"\"\n        Given a rotated sorted array nums with unique elements, return the index of target.\n        Time Complexity must be strictly O(log N).\n        \"\"\"\n        left, right = 0, len(nums) - 1\n        \n        while left <= right:\n            mid = left + (right - left) // 2\n            if nums[mid] == target:\n                return mid\n            \n            # Step 1: Identify which half is sorted\n            if nums[left] <= nums[mid]:\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            else:\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n                    \n        return -1\n',
    evaluation_score = 92,
    evaluation_feedback = 'Clean O(log N) binary search implementation. Correctly handles boundary pivot invariants without overflow.'
  WHERE id = 'tsk_1793012644448_0'
`).run();

// Task 2: Systems Architecture (Razorpay Core Payments target)
db.prepare(`
  UPDATE learning_tasks
  SET 
    task_type = 'Systems Architecture',
    focus_key = 'Idempotent REST APIs & Distributed Redis Locking',
    concepts_to_learn = 'UUIDv4 Idempotency-Key header, Redis SETNX atomic locking with TTL, Double-spend prevention under concurrent retries',
    starter_code = 'import time\nimport uuid\n\nclass PaymentTransactionService:\n    def __init__(self, cache_client):\n        self.cache = cache_client  # Simulated Key-Value Store\n        \n    def process_charge(self, idempotency_key: str, amount_inr: int, customer_id: str) -> dict:\n        \"\"\"\n        Guarantee zero duplicate charges even if client retries 10 times in 1 second.\n        \"\"\"\n        lock_key = f\"lock:payment:{idempotency_key}\"\n        record_key = f\"tx:payment:{idempotency_key}\"\n        \n        # 1. Check if transaction was already processed successfully\n        existing = self.cache.get(record_key)\n        if existing:\n            return {\"status\": \"SUCCESS\", \"source\": \"CACHE_IDEMPOTENT\", \"payload\": existing}\n            \n        # 2. Acquire atomic distributed lock (TTL: 10s)\n        acquired = self.cache.setnx(lock_key, \"PROCESSING\", ttl=10)\n        if not acquired:\n            raise RuntimeError(\"Concurrent duplicate request in flight. Please backoff.\")\n            \n        try:\n            tx_payload = {\n                \"tx_id\": f\"TXN_{uuid.uuid4().hex[:12].upper()}\",\n                \"customer_id\": customer_id,\n                \"amount\": amount_inr,\n                \"processed_at\": time.time()\n            }\n            self.cache.set(record_key, tx_payload)\n            return {\"status\": \"SUCCESS\", \"payload\": tx_payload}\n        finally:\n            self.cache.delete(lock_key)\n',
    evaluation_score = 95,
    evaluation_feedback = 'Production-grade idempotency flow. Correctly implements atomic acquire, cache check, and safe finally lock release.'
  WHERE id = 'tsk_1793012644448_1'
`).run();

// Task 3: Telemetry Engineering (ISRO Satellite Data Systems target)
db.prepare(`
  UPDATE learning_tasks
  SET 
    task_type = 'Telemetry Engineering',
    focus_key = 'Bitwise Frame Sync & Packet Checksum (CRC-32 / ISRO Telemetry)',
    concepts_to_learn = 'Bit shifting (<<, >>), Masking (0xFF), Little-Endian vs Big-Endian parsing, Synch Word 0xEB90 detection',
    starter_code = 'import struct\n\nSYNC_WORD = 0xEB90  # Standard CCSDS Frame Sync Word\n\ndef parse_telemetry_packet(raw_frame: bytes) -> dict:\n    \"\"\"\n    Parse raw binary satellite telemetry frame.\n    Frame format: [2 bytes Sync Word][2 bytes Subsystem ID][4 bytes Timestamp][4 bytes Altitude Float][2 bytes Checksum]\n    \"\"\"\n    if len(raw_frame) < 14:\n        raise ValueError(\"Frame too short for valid satellite telemetry\")\n        \n    sync, subsys, timestamp, altitude = struct.unpack(\">HHI f\", raw_frame[:12])\n    \n    if sync != SYNC_WORD:\n        raise ValueError(f\"Invalid Frame Sync: expected {hex(SYNC_WORD)}, got {hex(sync)}\")\n        \n    # Calculate XOR checksum across payload\n    checksum_calc = 0\n    for b in raw_frame[:12]:\n        checksum_calc ^= b\n        \n    checksum_received = struct.unpack(\">H\", raw_frame[12:14])[0]\n    is_valid = (checksum_calc == (checksum_received & 0xFF))\n    \n    return {\n        \"subsystem_id\": subsys,\n        \"timestamp\": timestamp,\n        \"altitude_km\": round(altitude, 3),\n        \"is_valid\": is_valid\n    }\n',
    evaluation_score = 90,
    evaluation_feedback = 'Solid binary framing logic using struct.unpack and XOR verification.'
  WHERE id = 'tsk_1793012644448_2'
`).run();

// Task 4: Hackathon Architecture Spec (Smart India Hackathon target)
db.prepare(`
  UPDATE learning_tasks
  SET 
    task_type = 'Hackathon Prototype Architecture',
    focus_key = 'System Decomposition Spec & Live Proof Verification (SIH 2026)',
    concepts_to_learn = 'C4 Architecture diagram notation, Edge caching, Database replication topology, Offline-first mobile synchronization',
    starter_code = '# System Architecture Specification: Smart India Hackathon (SIH 2026)\n\n## 1. Problem Statement & Problem ID\n- Problem ID: SIH-2026-MIN-089\n- Title: AI-Powered Geospatial Crop Health & Ground Water Telemetry\n\n## 2. Core Architectural Components\n- Client Layer: Flutter Mobile App with offline SQLite local queue\n- API Gateway: Fastify / Next.js Node.js server with JWT cryptographic signatures\n- Inference Engine: PyTorch Lightweight ResNet-18 model quantized for ONNX Runtime\n- Telemetry Store: PostgreSQL with PostGIS extension for spatial queries\n\n## 3. High-Leverage Differentiator\n- Works in 2G / zero-connectivity rural zones via intermittent opportunistic sync\n- Proof-of-work artifact validated and ledger-hashed on Beacon OS\n',
    evaluation_score = 88,
    evaluation_feedback = 'Thorough system design spec covering offline constraints, spatial indices, and verifiable architecture.'
  WHERE id = 'tsk_1793012644448_3'
`).run();

console.log('Successfully updated learning_tasks with rich interactive task fields!');
db.close();
