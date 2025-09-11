Here’s a **clean, final** `DIARY.md` you can paste into your repo.
Style: **narration in English**, **inline tri-lingual comments** in every code line (`// EN: … / DE: … / RU: …`).
All sections are numbered 1–10 and match your current files.

---

````markdown
# DIARY.md — my-blockchain (Portfolio Edition)

**Repo:** `my-blockchain`  
**Date:** 2025-09-10  
**Goal:** Build a minimal Proof-of-Work blockchain (Node.js) with transactions, signatures, mempool, blocks, chain validation — step by step, reproducibly.

> This diary is a **rebuild log**. If you follow it, you can recreate the project from scratch months later.
> Code comments are inline and tri-lingual: `// EN: … / DE: … / RU: …`.

---

## Table of Contents
1. [Create the repository](#1-create-the-repository)  
2. [Utilities: crypto & serialization (`utils.js`)](#2-utilities-crypto--serialization-utilsjs)  
3. [Transactions, signatures, mempool (`transaction.js`)](#3-transactions-signatures-mempool-transactionjs)  
4. [Block with PoW mining (`block.js`)](#4-block-with-pow-mining-blockjs)  
5. [Blockchain container (`blockchain.js`)](#5-blockchain-container-blockchainjs)  
6. [Refactor: tests & package scripts](#6-refactor-tests--package-scripts)  
7. [Integrate mempool → mining (`mineFromMempool`)](#7-integrate-mempool--mining-minefrommempool)  
8. [Proof-of-Work demo CLI (`pow-demo.js`)](#8-proof-of-work-demo-cli-pow-demojs)  
9. [End-to-end demo: shared mempool](#9-end-to-end-demo-shared-mempool)  
10. [Basic unit tests (Node assert)](#10-basic-unit-tests-node-assert)
11. [Commits & Project hygiene](#11-commits--project-hygiene)  
12. [Next steps](#12-next-steps)  
13. [Changelog](#13-changelog)  
14. [PR-plan](#14-pr-plan) 


---

## 1) Create the repository

**Intent:** keep repo clean and professional from the start; avoid “setup” noise.

```bash
mkdir my-blockchain && cd my-blockchain                   # EN: create folder / DE: Ordner anlegen / RU: создать папку
git init                                                  # EN: init repo / DE: Repo initialisieren / RU: инициализация репо
echo "# My Blockchain Learning (JS)" > README.md          # EN: seed README / DE: README anlegen / RU: создать README
node -v && npm -v                                         # EN: verify toolchain / DE: Toolchain prüfen / RU: проверить версии
npm init -y                                               # EN: package.json / DE: package.json / RU: package.json
git add . && git commit -m "chore: init repository"
````

Optional: add a remote and push.

---

## 2) Utilities: crypto & serialization (`utils.js`)

**Intent:** one place for hashing + deterministic JSON, reused by tx/block/chain.

Create `utils.js`:

```js
// utils.js — Shared helpers (crypto & serialization)           // EN: Shared helpers / DE: Gemeinsame Helfer / RU: Общие утилиты
'use strict';                                                   // EN: Strict mode / DE: Strict Mode / RU: Строгий режим
const crypto = require('crypto');                               // EN: Node crypto / DE: Node-Krypto / RU: Модуль crypto

function sha256Hex(data) {                                      // EN: SHA-256 to hex / DE: SHA-256 nach Hex / RU: SHA-256 в hex
  return crypto.createHash('sha256').update(data).digest('hex');// EN: Pipe & digest / DE: Hash berechnen / RU: Вычислить хэш
}

function serializeTx(tx) {                                      // EN: Canonical tx JSON / DE: Kanonisches Tx-JSON / RU: Каноничный JSON
  const ordered = {                                             // EN: Fixed order / DE: Feste Reihenfolge / RU: Фиксированный порядок
    from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce
  };
  return JSON.stringify(ordered);                               // EN: Stable string / DE: Stabile Zeichenfolge / RU: Стабильная строка
}

function serializeHeader(h) {                                   // EN: Canonical block header / DE: Kanonischer Header / RU: Каноничный заголовок
  const ordered = {                                             // EN: Fields in order / DE: Felder geordnet / RU: Порядок полей
    index: h.index, previousHash: h.previousHash, timestamp: h.timestamp,
    txRoot: h.txRoot, difficulty: h.difficulty, nonce: h.nonce
  };
  return JSON.stringify(ordered);                               // EN: Stable string / DE: Stabil / RU: Стабильно
}

function simpleTxRoot(transactions) {                           // EN: Simple tx root (not Merkle) / DE: Einfacher Tx-Root / RU: Простой корень
  const normalized = transactions.map(t => JSON.parse(serializeTx(t)));
  const listJson = JSON.stringify(normalized);
  return sha256Hex(listJson);                                   // EN: Hash of list / DE: Listen-Hash / RU: Хэш списка
}

module.exports = { sha256Hex, serializeTx, serializeHeader, simpleTxRoot }; // EN: Exports / DE: Exporte / RU: Экспорт
```

Commit:

```bash
git add utils.js && git commit -m "feat(utils): sha256Hex/serializeTx/serializeHeader/simpleTxRoot"
```

---

## 3) Transactions, signatures, mempool (`transaction.js`)

**Intent:** demonstrate signing & verification; keep a minimal mempool with basic validation.

Create `transaction.js`:

```js
// transaction.js — Keys → address → tx → sign/verify → mempool        // EN / DE / RU
'use strict';                                                          // EN: Strict mode / DE / RU
const crypto = require('crypto');                                      // EN: Node crypto / DE / RU
const { serializeTx, sha256Hex } = require('./utils');                 // EN: Helpers / DE / RU

// --- Keys & address ---------------------------------------------------------
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {   // EN: ECDSA pair / DE / RU
  namedCurve: 'secp256k1',                                             // EN: Curve / DE / RU
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },                // EN: Pubkey PEM / DE / RU
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }                 // EN: Privkey PEM / DE / RU
});

function toAddress(publicKeyPem) {                                     // EN: Short address / DE / RU
  const h = sha256Hex(publicKeyPem);                                   // EN: Hash pubkey / DE / RU
  return '0x' + h.slice(0, 40);                                        // EN: First 20 bytes / DE / RU
}

const address = toAddress(publicKey);                                  // EN: Sender address / DE / RU

// --- Build tx ---------------------------------------------------------------
const tx = { from: address, to: '0x96a23e4cd1fdea96c571cadfe6b5318abcee84cc', amount: 100, nonce: 1 };
const txJson = serializeTx(tx);                                        // EN: Canonical JSON / DE / RU
const txHash = sha256Hex(txJson);                                      // EN: Fingerprint / DE / RU

// --- Sign & verify ----------------------------------------------------------
function signTx(json, privPem) { const s = crypto.createSign('SHA256'); s.update(json); s.end(); return s.sign(privPem,'hex'); }
function verifyTx(json, sigHex, pubPem) { const v = crypto.createVerify('SHA256'); v.update(json); v.end(); return v.verify(pubPem,sigHex,'hex'); }

const signature = signTx(txJson, privateKey);                          // EN: Signature / DE / RU
console.log('Address:', address);                                      // EN: Log / DE / RU
console.log('TX JSON:', txJson);                                       // EN: Log / DE / RU
console.log('TX Hash:', txHash);                                       // EN: Log / DE / RU
console.log('Valid signature?', verifyTx(txJson, signature, publicKey));// EN: true / DE: true / RU: true

// --- Tamper test ------------------------------------------------------------
const tampered = { ...tx, amount: 9999 };                              // EN: Modify / DE / RU
console.log('Valid after tamper?', verifyTx(serializeTx(tampered), signature, publicKey)); // EN: false / DE / RU

// --- Minimal mempool with validator ----------------------------------------
const mempool = [];                                                     // EN: Pending txs / DE / RU
function addToMempool(txObj, sigHex, pubPem) {                          // EN: Validate & add / DE / RU
  const canon = serializeTx(txObj);                                     // EN: Canonical / DE / RU
  if (!verifyTx(canon, sigHex, pubPem)) throw new Error('Invalid signature');
  if (txObj.from !== toAddress(pubPem)) throw new Error('From≠pubkey address');
  const dup = mempool.some(e => e.tx.from === txObj.from && e.tx.nonce === txObj.nonce);
  if (dup) throw new Error('Duplicate (from, nonce) in mempool');
  mempool.push({ tx: txObj, signature: sigHex, pubKey: pubPem });
}

try { addToMempool(tx, signature, publicKey); console.log('Mempool size:', mempool.length); }
catch (e) { console.log('Mempool reject:', e.message); }

module.exports = { serializeTx, sha256Hex, signTx, verifyTx, toAddress, mempool }; // EN: Exports / DE / RU
```

Commit:

```bash
git add transaction.js && git commit -m "feat(tx): signing/verification + minimal mempool"
```

---

## 4) Block with PoW mining (`block.js`)

**Intent:** header includes `difficulty` & `nonce`; PoW satisfied when `hash` has N leading zeros.

Create `block.js`:

```js
// block.js — Block + PoW mining with utils                                // EN / DE / RU
'use strict';
const { sha256Hex, serializeHeader, simpleTxRoot } = require('./utils');  // EN: Helpers / DE / RU

class Block {                                                             // EN: Block class / DE / RU
  constructor({ index, previousHash, timestamp, transactions, difficulty = 2, nonce = 0 }) {
    this.index = index;                                                   // EN: Height / DE / RU
    this.previousHash = previousHash;                                     // EN: Parent hash / DE / RU
    this.timestamp = timestamp;                                           // EN: ms / DE / RU
    this.transactions = transactions;                                     // EN: Payload / DE / RU
    this.txRoot = simpleTxRoot(transactions);                             // EN: Deterministic root / DE / RU
    this.difficulty = difficulty;                                         // EN: Target zeros / DE / RU
    this.nonce = nonce;                                                   // EN: Counter / DE / RU
    this.hash = this.computeHash();                                       // EN: Initial header hash / DE / RU
  }
  header() { return { index: this.index, previousHash: this.previousHash, timestamp: this.timestamp, txRoot: this.txRoot, difficulty: this.difficulty, nonce: this.nonce }; }
  computeHash() { return sha256Hex(serializeHeader(this.header())); }     // EN: Hash header / DE / RU
  recomputeHash() { this.hash = this.computeHash(); return this.hash; }   // EN: Refresh / DE / RU
  meetsDifficulty() { const p = '0'.repeat(this.difficulty); return this.hash.startsWith(p); } // EN: Check / DE / RU
  mine(maxIterations = 1e7) {                                             // EN: Brute-force / DE / RU
    const p = '0'.repeat(this.difficulty); let it = 0;
    while (!this.hash.startsWith(p)) { this.nonce++; this.recomputeHash(); if (++it >= maxIterations) throw new Error('PoW: max iterations reached'); }
    return this;                                                          // EN: Done / DE / RU
  }
}
module.exports = Block;                                                   // EN: Export / DE / RU
```

Commit:

```bash
git add block.js && git commit -m "feat(block): PoW block (difficulty/nonce) + mining()"
```

---

## 5) Blockchain container (`blockchain.js`)

**Intent:** maintain a valid chain; create genesis; mine & append blocks; validate PoW and linkage.

Create `blockchain.js`:

```js
// blockchain.js — Simple chain with PoW mining                               // EN / DE / RU
'use strict';
const Block = require('./block');                                           // EN: Use Block / DE / RU

class Blockchain {                                                          // EN: Chain / DE / RU
  constructor({ difficulty = 3 } = {}) { this.difficulty = difficulty; this.chain = [this.createGenesisBlock()]; }
  createGenesisBlock() {                                                    // EN: Genesis / DE / RU
    const b = new Block({ index: 0, previousHash: '0'.repeat(64), timestamp: Date.now(), transactions: [], difficulty: this.difficulty, nonce: 0 });
    return b;
  }
  latest() { return this.chain[this.chain.length - 1]; }                    // EN: Tip / DE / RU

  addBlock(block) {                                                         // EN: Validate & append / DE / RU
    const tip = this.latest();
    if (block.index !== tip.index + 1) throw new Error('Bad index');
    if (block.previousHash !== tip.hash) throw new Error('Bad prevHash');
    if (!block.meetsDifficulty()) throw new Error('Not mined');
    if (block.computeHash() !== block.hash) throw new Error('Hash mismatch');
    this.chain.push(block);
    return block;
  }

  mineBlock(transactions = []) {                                            // EN: Build→mine→add / DE / RU
    const b = new Block({ index: this.latest().index + 1, previousHash: this.latest().hash, timestamp: Date.now(), transactions, difficulty: this.difficulty, nonce: 0 });
    b.mine();
    return this.addBlock(b);
  }

  // (Used later in §7)
  mineFromMempool(mempool, maxTx = Infinity) {                              // EN: Pull from mempool / DE / RU
    if (!mempool || typeof mempool.takeAll !== 'function') throw new Error('mineFromMempool: mempool.takeAll() required');
    const txs = mempool.takeAll(maxTx);
    return this.mineBlock(txs);
  }

  isValid() {                                                               // EN: Full chain check / DE / RU
    for (let i = 1; i < this.chain.length; i++) {
      const prev = this.chain[i - 1], cur = this.chain[i];
      if (cur.previousHash !== prev.hash) return false;
      if (!cur.meetsDifficulty()) return false;
      if (cur.computeHash() !== cur.hash) return false;
    }
    return true;
  }
}
module.exports = Blockchain;                                                // EN: Export / DE / RU
```

Commit:

```bash
git add blockchain.js && git commit -m "feat(blockchain): genesis, mineBlock(), isValid(), mineFromMempool()"
```

---

## 6) Refactor: tests & package scripts

**Intent:** provide quick commands and a smoke test path.

Update `package.json` scripts (only `scripts` shown here):

```json
{
  "scripts": {
    "start": "node transaction.js",            // EN/DE/RU: Run tx demo
    "block": "node test-block.js",             // EN/DE/RU: PoW block demo
    "chain": "node test-chain.js",             // EN/DE/RU: Chain demo
    "mine:mempool": "node test-mine-mempool.js", // EN/DE/RU: Mempool mining demo
    "pow": "node pow-demo.js --difficulty 3 -t",
    "test": "node test/basic.test.js"
  }
}
```

Commit:

```bash
git add package.json && git commit -m "chore(npm): scripts for demos and tests"
```

---

## 7) Integrate mempool → mining (`mineFromMempool`)

**Intent:** use real pending transactions from a mempool module.

Create `mempool.js`:

```js
// mempool.js — Minimal pending-transactions pool                         // EN / DE / RU
'use strict';
class Mempool {
  constructor(validator = null, maxSize = 1000) { this._items = []; this._validator = validator; this._maxSize = maxSize; }
  size() { return this._items.length; }
  _isDup(tx) { return this._items.some(e => e.tx.from === tx.from && e.tx.nonce === tx.nonce); }
  add(tx, signature = null, pubKey = null) {
    if (this.size() >= this._maxSize) throw new Error('Mempool full');
    if (this._isDup(tx)) throw new Error('Duplicate (from, nonce) in mempool');
    if (this._validator && !this._validator(tx, signature, pubKey)) throw new Error('Validation failed');
    this._items.push({ tx, signature, pubKey }); return this.size();
  }
  takeAll(maxCount = Infinity) { const cut = this._items.splice(0, Math.min(maxCount, this.size())); return cut.map(e => e.tx); }
  peekAll() { return this._items.map(e => ({ ...e })); }
  clear() { this._items.length = 0; }
}
module.exports = Mempool;
```

Create `test-mine-mempool.js`:

```js
// test-mine-mempool.js — demo: mine a block using mempool txs          // EN / DE / RU
'use strict';
const Blockchain = require('./blockchain');
const Mempool = require('./mempool');

const mempool = new Mempool(null, 1000);
mempool.add({ from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 });
mempool.add({ from: '0xccc', to: '0xddd', amount: 7, nonce: 1 });

console.log('Mempool size before mining:', mempool.size());
const chain = new Blockchain({ difficulty: 2 });
console.log('⛏ Mining from mempool...');
const block = chain.mineFromMempool(mempool);
console.log('Mined hash:', block.hash);
console.log('Nonce:', block.nonce);
console.log('Tx count in block:', block.transactions.length);
console.log('Mempool size after mining:', mempool.size());
console.log('Chain valid?', chain.isValid());
```

Commit:

```bash
git add mempool.js test-mine-mempool.js && git commit -m "feat(mempool): integrate with mining via mineFromMempool()"
```

---

## 8) Proof-of-Work demo CLI (`pow-demo.js`)

**Intent:** visualize PoW; flags for difficulty, logging, stable timestamp.

Create `pow-demo.js`:

```js
// pow-demo.js — Visual PoW demo (spinner + flags)                       // EN / DE / RU
'use strict';
const Block = require('./block');
const argv = process.argv.slice(2);
const hasFlag = (f) => argv.includes(f) || argv.includes(f.replace('--','-'));
const num = (name, def) => { const i = argv.findIndex(a => a === name || a === name.replace('--','-')); return (i >= 0 && argv[i+1] && !argv[i+1].startsWith('-')) ? Number(argv[i+1]) : def; };

const difficulty = num('--difficulty', 3);
const maxIter = num('--maxIter', 1e7);
const logEvery = num('--logEvery', 50000);
const timestampStable = hasFlag('--timestampStable') || hasFlag('-t');
const noSpinner = hasFlag('--noSpinner');

console.log(`Params → difficulty=${difficulty}, maxIter=${maxIter}, logEvery=${logEvery}, timestampStable=${timestampStable}`);

const fixedTs = Date.now();
const b = new Block({ index: 1, previousHash: '00', timestamp: timestampStable ? fixedTs : Date.now(), transactions: [], difficulty, nonce: 0 });

const frames = ['|','/','-','\\']; let spin = 0; let spinner;
if (!noSpinner) spinner = setInterval(() => process.stdout.write(`\r${frames[spin = (spin+1)%frames.length]} mining… nonce=${b.nonce}`), 80);

let attempts = 0; const prefix = '0'.repeat(difficulty); const t0 = Date.now();
console.log('\n⛏ Mining…');
while (!b.hash.startsWith(prefix)) { b.nonce++; b.recomputeHash(); attempts++; if (attempts % logEvery === 0) process.stdout.write(`\r… attempts=${attempts}, nonce=${b.nonce}`); if (attempts >= maxIter) { if (spinner) clearInterval(spinner); console.error(`\n❌ Gave up after ${attempts}`); process.exit(1); } }
if (spinner) clearInterval(spinner); process.stdout.write('\r');

const t1 = Date.now(); const elapsed = (t1 - t0)/1000; const rate = Math.floor(attempts/(elapsed||1));
console.log('✅ Mined!'); console.log('Hash:', b.hash); console.log('Nonce:', b.nonce); console.log('Attempts:', attempts);
console.log(`Time: ${elapsed.toFixed(2)} s`); console.log(`Rate≈ ${rate}/s`); console.log(`Timestamp: ${b.timestamp}  (stable=${timestampStable})`);
```

Commit:

```bash
git add pow-demo.js && git commit -m "feat(cli): PoW demo with flags and spinner"
```

---

## 9) End-to-end demo: shared mempool

**Intent:** mine a block using the same mempool populated in `transaction.js`.

Create `mine-from-mempool.js`:

```js
// mine-from-mempool.js — use the mempool exported by transaction.js     // EN / DE / RU
'use strict';
const Blockchain = require('./blockchain');
const { mempool } = require('./transaction');       // EN: reuse same mempool / DE / RU

const chain = new Blockchain({ difficulty: 2 });
console.log('⛏ Mining from mempool...');
const b1 = chain.mineFromMempool(mempool);
console.log('Mined block hash:', b1.hash);
console.log('Nonce:', b1.nonce);
console.log('Tx count in block:', b1.transactions.length);
console.log('Chain valid?', chain.isValid());
```

Commit:

```bash
git add mine-from-mempool.js && git commit -m "feat(demo): mine block from the same mempool as transaction.js"
```

---

## 10) Basic unit tests (Node assert)

**Intent:** quick regressions without a framework.

Create `test/basic.test.js`:

```js
// test/basic.test.js — sanity checks                                      // EN / DE / RU
'use strict';
const assert = require('assert');
const crypto = require('crypto');
const { serializeTx, sha256Hex } = require('../utils');

const tx = { from: 'a', to: 'b', amount: 10, nonce: 1 };
const ser = serializeTx(tx);
assert.strictEqual(ser, JSON.stringify({ from: 'a', to: 'b', amount: 10, nonce: 1 }), 'serializeTx() must be deterministic');

const nodeHash = crypto.createHash('sha256').update('test').digest('hex');
const helperHash = sha256Hex('test');
assert.strictEqual(helperHash, nodeHash, 'sha256Hex() must match Node crypto output');
assert.strictEqual(helperHash.length, 64, 'sha256Hex() must return 64 hex chars');

const txWithExtra = { ...tx, foo: 123, bar: 'x' };
assert.strictEqual(serializeTx(txWithExtra), ser, 'serializeTx() must ignore extra fields');

console.log('✅ All basic tests passed');
```

Commit and run:

```bash
git add test/basic.test.js && git commit -m "test: basic utils & serialization checks"
npm run test
```

---

## 11) Commits & Project hygiene

**Commit style:**

* `feat(utils): add sha256Hex/serializeTx/serializeHeader/simpleTxRoot`
* `feat(block): PoW block (difficulty/nonce) and mining`
* `feat(blockchain): genesis, mineBlock(), isValid()`
* `feat(tx): signing/verification and minimal mempool`
* `test: add PoW and chain smoke tests`

**README.md:** keep concise (what/why/how-to-run + expected output).

**Optional DX:** VS Code Spell Checker (workspace `settings.json`):

```json
{
  "cSpell.language": "en,de,ru",
  "cSpell.words": ["nonce", "txroot", "sha256", "txs"],
  "cSpell.allowCompoundWords": true
}
```

---

## 12) Next steps

1) Integrate real mempool selection into `mineBlock()` (valid txs, size/weight limit)  
   - **Acceptance:** `mineBlock()` pulls pending txs from the mempool (e.g., `mempool.takeAll(limit)`), enforces a `BLOCK_TX_LIMIT` (or byte-size limit), and includes only validator-approved txs. A test proves: mempool size decreases, block contains ≤ limit, chain stays valid.

2) Add balances/state (account model or simple UTXO), prevent overspending  
   - **Option A (Accounts):** balances map `{address -> number}`; reject tx if `balance[from] < amount`; update balances when block is added.  
   - **Option B (UTXO):** maintain unspent outputs; build inputs/outputs; reject double-spends.  
   - **Acceptance:** overspend txs are rejected before mempool insert; state transitions are deterministic and chain-valid.

3) P2P sync (peers, block propagation), basic explorer  
   - Minimal peer protocol: broadcast new tx/block; receive and validate; resolve conflicts via Longest-Chain (or most-work) rule.  
   - Basic explorer/CLI: list latest blocks/txs; show balances or UTXOs.  
   - **Acceptance:** two local nodes converge to the same tip after independent mining; simple UI/CLI displays chain state.

4) Solidity + Remix VM: first contracts, local deployment pipeline  
   - Write a tiny Solidity contract; compile & deploy locally (Remix or Hardhat); add a script/README notes to reproduce.  
   - **Acceptance:** contract compiles, deploys, and a simple call/tx succeeds locally; steps are documented.


---

## 13) Changelog
- **28.08.2025 (Day 1):** Created repo `my-blockchain`, added `transaction.js` (keys, tx, signature, mempool).  
- **30.08.2025 (Day 3):** Added `utils.js` (sha256Hex, serializeTx, serializeHeader, simpleTxRoot).  
- **01.09.2025 (Day 5):** Added `block.js` (difficulty, PoW mining).  
- **02.09.2025 (Day 6):** Added `blockchain.js` (genesis, mineBlock, isValid).  
- **03.09.2025 (Day 7):** Created `DIARY.md` (portfolio edition).  
- **08.09.2025 (Day 10):** Вынесены крипто-хелперы (tx-crypto.js), обновлён transaction.js.  
- **10.09.2025 (Day 12):** Добавлен mempool.js, подключён валидатор подписей.  
- **11.09.2025 (Day 13):** Blockchain.mineFromMempool(), тесты интеграции.  
- **12.09.2025 (Day 14):** Полный прогон тестов, синхронизация README/ROADMAP/DIARY.  

---

## 14) PR-plan

- [ ] **Refactor:** stabilize `transaction.js` as a demo-only script; keep all crypto helpers in `tx-crypto.js` and `utils.js`.
- [ ] **Integrate:** add `mineFromMempool()` to `Blockchain` (already implemented) → cover with `test-mine-mempool.js`.
- [ ] **Feature:** implement miner reward (coinbase transaction) in each mined block.
- [ ] **Feature:** introduce account balances and reject overspending before inserting a transaction into the mempool.
- [ ] **Tests:** extend coverage (Node assert / Jest) to verify:
  - duplicate (from, nonce) detection in mempool,
  - correct miner reward,
  - rejection of overspending transactions.
- [ ] **P2P:** simulate multiple nodes, implement block/tx propagation and Longest Chain Rule.
- [ ] **DX:** improve README/ROADMAP/DIARY with more examples, screenshots, and consistent structure.
- [ ] **Explorer:** add CLI or minimal HTTP API for chain inspection.
- [ ] **Solidity:** start with a simple smart contract in Remix VM and document the process in `DIARY.md`.



> Keep commits small and meaningful. This diary grows as features land — append new steps with dates.
