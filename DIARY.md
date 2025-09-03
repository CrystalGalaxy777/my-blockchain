# DIARY.md — my-blockchain (Portfolio Edition)

**Repo:** `my-blockchain`
**Date:** 03.09.2025
**Goal:** Build a minimal Proof‑of‑Work blockchain (JS/Node) with transactions, signatures, mempool, blocks, chain validation.

> This diary is written as a **reproducible build log**: if you follow the steps below, you can recreate the project from scratch. Explanations are concise and professional. Code comments are **inline** in **EN/DE/RU**.

---

## Table of Contents

1. [Create the repository](#1-create-the-repository)
2. [Utilities: crypto & serialization (`utils.js`)](#2-utilities-crypto--serialization-utilsjs)
3. [Transactions, signatures, mempool (`transaction.js`)](#3-transactions-signatures-mempool-transactionjs)
4. [Block with PoW mining (`block.js`)](#4-block-with-pow-mining-blockjs)
5. [Blockchain container (`blockchain.js`)](#5-blockchain-container-blockchainjs)
6. [Smoke tests (`test-block.js`, `test-chain.js`)](#6-smoke-tests-test-blockjs-test-chainjs)
7. [Commits & Project hygiene](#7-commits--project-hygiene)
8. [Next steps](#8-next-steps)

---

## 1) Create the repository

**Intent:** keep repo clean and professional from the start; avoid “setup” chatter in portfolio.

```bash
mkdir my-blockchain && cd my-blockchain
git init
echo "# My Blockchain Learning (JS)" > README.md
git add README.md && git commit -m "chore: init repository with README"
```

Optional: add a remote and push.

---

## 2) Utilities: crypto & serialization (`utils.js`)

**Intent:** single source of truth for hashing and deterministic JSON, reused by tx/block/chain.

Create `utils.js`:

```js
// utils.js — Shared helpers (crypto & serialization) // EN: Shared helpers / DE: Gemeinsame Helfer / RU: Общие утилиты

const crypto = require('crypto'); // EN: Import Node.js crypto / DE: Node.js-Krypto importieren / RU: Подключаем модуль crypto

function sha256Hex(data) { // EN: SHA-256 wrapper / DE: SHA-256-Hülle / RU: Обёртка для SHA-256
  return crypto.createHash('sha256').update(data).digest('hex'); // EN: Hash to hex / DE: Hash als Hex / RU: Хэш в hex
}

function serializeTx(tx) { // EN: Deterministic tx serialization / DE: Deterministische Tx-Serialisierung / RU: Детерминированная сериализация транзакции
  const ordered = { from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce }; // EN: Canonical field order / DE: Kanonische Feldreihenfolge / RU: Каноничный порядок полей
  return JSON.stringify(ordered); // EN: Stable JSON / DE: Stabiles JSON / RU: Стабильный JSON
}

function serializeHeader(header) { // EN: Deterministic block header serialization / DE: Deterministische Header-Serialisierung / RU: Детерминированная сериализация заголовка
  const ordered = { // EN: Build canonical header object / DE: Kanonisches Header-Objekt / RU: Каноничный объект заголовка
    index: header.index, // EN: Block height / DE: Blockhöhe / RU: Высота блока
    previousHash: header.previousHash, // EN: Parent hash / DE: Vorgänger-Hash / RU: Хэш предыдущего
    timestamp: header.timestamp, // EN: Creation time (ms) / DE: Erstellzeit (ms) / RU: Время создания (мс)
    txRoot: header.txRoot, // EN: Transactions root / DE: Transaktions-Root / RU: Корень транзакций
    difficulty: header.difficulty, // EN: PoW difficulty / DE: PoW-Schwierigkeit / RU: Сложность PoW
    nonce: header.nonce // EN: Changing counter / DE: Zählwert (Nonce) / RU: Счётчик (nonce)
  }; // EN: End canonical header / DE: Ende kanonischer Header / RU: Конец каноничного заголовка
  return JSON.stringify(ordered); // EN: Stable JSON / DE: Stabiles JSON / RU: Стабильный JSON
}

function simpleTxRoot(transactions) { // EN: Simple deterministic tx root (not Merkle) / DE: Einfacher deterministischer Tx-Root / RU: Простой детерминированный корень (не Меркле)
  const normalized = transactions.map(tx => JSON.parse(serializeTx(tx))); // EN: Normalize each tx / DE: Jede Tx normalisieren / RU: Нормализуем каждую транзакцию
  const json = JSON.stringify(normalized); // EN: Canonical list JSON / DE: Kanonische JSON-Liste / RU: Канонический JSON списка
  return sha256Hex(json); // EN: Hash as root / DE: Hash als Root / RU: Хэш как корень
}

module.exports = { sha256Hex, serializeTx, serializeHeader, simpleTxRoot }; // EN: Export helpers / DE: Helfer exportieren / RU: Экспорт утилит
```

```bash
git add utils.js && git commit -m "feat(utils): add sha256Hex/serializeTx/serializeHeader/simpleTxRoot"
```

---

## 3) Transactions, signatures, mempool (`transaction.js`)

**Intent:** demonstrate signing & verification; keep a minimal mempool with basic validation.

Create `transaction.js`:

```js
// transaction.js — Keys, address, tx, sign/verify, mempool // EN/DE/RU: Учебный демо-скрипт

const crypto = require('crypto'); // EN: Node crypto / DE: Node-Krypto / RU: Модуль crypto
const { serializeTx, sha256Hex } = require('./utils'); // EN: Reuse utils / DE: Utils wiederverwenden / RU: Переиспользуем утилиты

// --- Keys & Address ---------------------------------------------------------
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { // EN: ECDSA keypair / DE: ECDSA-Schlüsselpaar / RU: Пара ключей ECDSA
  namedCurve: 'secp256k1', publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } // EN/DE/RU: Форматы ключей
});

function toAddress(publicKeyPem) { // EN: Derive address / DE: Adresse ableiten / RU: Получить адрес
  const hash = sha256Hex(publicKeyPem); // EN: SHA-256 of pubkey / DE: SHA-256 des Pubkeys / RU: SHA-256 публичного ключа
  return '0x' + hash.slice(0, 40); // EN: First 20 bytes / DE: Erste 20 Bytes / RU: Первые 20 байт
}

const address = toAddress(publicKey); // EN/DE/RU: Адрес отправителя

// --- Build & hash tx --------------------------------------------------------
const tx = { from: address, to: '0x96a23e4cd1fdea96c571cadfe6b5318abcee84cc', amount: 100, nonce: 1 }; // EN/DE/RU: Тестовая транзакция
const txJson = JSON.stringify({ from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce }); // EN: Canonical JSON / DE: Kanonisches JSON / RU: Каноничный JSON
const txHash = sha256Hex(txJson); // EN/DE/RU: Хэш транзакции

// --- Sign & verify ----------------------------------------------------------
function signTx(txJson, privateKeyPem) { // EN: Create signature / DE: Signatur erstellen / RU: Подписать транзакцию
  const signer = crypto.createSign('SHA256'); signer.update(txJson); signer.end(); return signer.sign(privateKeyPem, 'hex'); // EN/DE/RU: Подпись hex
}
function verifyTx(txJson, signatureHex, publicKeyPem) { // EN: Verify signature / DE: Signatur prüfen / RU: Проверить подпись
  const v = crypto.createVerify('SHA256'); v.update(txJson); v.end(); return v.verify(publicKeyPem, signatureHex, 'hex'); // EN/DE/RU: true/false
}
const signature = signTx(txJson, privateKey); // EN/DE/RU: Получаем подпись

// --- Mempool with minimal checks -------------------------------------------
const mempool = []; // EN: Pending txs / DE: Ausstehende Txs / RU: Неподтверждённые транзакции
function addToMempool(txObj, sigHex, pubKeyPem) { // EN: Validate & add / DE: Validieren & hinzufügen / RU: Проверить и добавить
  if (!verifyTx(JSON.stringify({ from: txObj.from, to: txObj.to, amount: txObj.amount, nonce: txObj.nonce }), sigHex, pubKeyPem)) throw new Error('Invalid signature'); // EN/DE/RU: Проверка подписи
  if (txObj.from !== toAddress(pubKeyPem)) throw new Error('From address does not match public key'); // EN/DE/RU: Проверка адреса
  const dup = mempool.some(e => e.tx.from === txObj.from && e.tx.nonce === txObj.nonce); if (dup) throw new Error('Duplicate (from, nonce) in mempool'); // EN/DE/RU: Защита от дублей
  mempool.push({ tx: txObj, signature: sigHex }); // EN/DE/RU: Добавляем в mempool
}

// --- Demo output ------------------------------------------------------------
console.log('Address:', address); // EN/DE/RU: Адрес
console.log('TX JSON:', txJson); // EN/DE/RU: Каноничный JSON транзакции
console.log('Signature valid?', verifyTx(txJson, signature, publicKey)); // EN/DE/RU: Ожидаем true
console.log('Tamper test:', verifyTx(JSON.stringify({ ...tx, amount: 9999, nonce: tx.nonce }), signature, publicKey)); // EN/DE/RU: Ожидаем false
try { addToMempool(tx, signature, publicKey); console.log('Mempool size:', mempool.length); } catch (e) { console.log('Mempool reject:', e.message); } // EN/DE/RU: Демонстрация mempool
```

```bash
git add transaction.js && git commit -m "feat(tx): signing/verification and minimal mempool"
```

---

## 4) Block with PoW mining (`block.js`)

**Intent:** block header includes `difficulty` & `nonce`; PoW is satisfied when `hash` starts with N zeros.

Create `block.js`:

```js
// block.js — Block with PoW mining via utils // EN: Block + mining / DE: Block + Mining / RU: Блок + майнинг

const { sha256Hex, serializeHeader, simpleTxRoot } = require('./utils'); // EN: Reuse utils / DE: Utils wiederverwenden / RU: Переиспользуем утилиты

class Block { // EN: Block class / DE: Block-Klasse / RU: Класс блока
  constructor({ index, previousHash, timestamp, transactions, difficulty = 2, nonce = 0 }) { // EN: Init fields / DE: Felder initialisieren / RU: Инициализация полей
    this.index = index; // EN: Height / DE: Höhe / RU: Высота
    this.previousHash = previousHash; // EN: Parent hash / DE: Vorgänger-Hash / RU: Хэш предыдущего
    this.timestamp = timestamp; // EN: Unix ms / DE: Unix ms / RU: Unix мс
    this.transactions = transactions; // EN: Payload / DE: Nutzlast / RU: Полезная нагрузка
    this.txRoot = simpleTxRoot(transactions); // EN: Deterministic tx root / DE: Deterministischer Tx-Root / RU: Детерминированный корень
    this.difficulty = difficulty; // EN: PoW difficulty / DE: PoW-Schwierigkeit / RU: Сложность PoW
    this.nonce = nonce; // EN: Will change while mining / DE: Ändert sich beim Mining / RU: Меняется при майнинге
    this.hash = this.computeHash(); // EN: Initial header hash / DE: Initialer Header-Hash / RU: Начальный хэш заголовка
  }

  header() { // EN: Build header object / DE: Header-Objekt bauen / RU: Собрать объект заголовка
    return { // EN: Fields define hash / DE: Felder bestimmen Hash / RU: Поля определяют хэш
      index: this.index, // EN/DE/RU: Height / Höhe / Высота
      previousHash: this.previousHash, // EN/DE/RU: Link / Verknüpfung / Связь
      timestamp: this.timestamp, // EN/DE/RU: Time / Zeit / Время
      txRoot: this.txRoot, // EN/DE/RU: Tx root / Tx-Root / Корень транзакций
      difficulty: this.difficulty, // EN/DE/RU: Difficulty / Schwierigkeit / Сложность
      nonce: this.nonce // EN/DE/RU: Nonce / Nonce / Нонс
    }; // EN/DE/RU: End header
  }

  computeHash() { // EN: SHA-256 over serialized header / DE: SHA-256 über serialisierten Header / RU: SHA-256 по сериализованному заголовку
    const data = serializeHeader(this.header()); // EN: Deterministic bytes / DE: Deterministische Bytes / RU: Детерминированные байты
    return sha256Hex(data); // EN: Hex hash / DE: Hex-Hash / RU: Hex-хэш
  }

  recomputeHash() { // EN: Recompute after nonce changes / DE: Neu berechnen nach Nonce-Änderungen / RU: Пересчёт после изменения nonce
    this.hash = this.computeHash(); // EN: Update cached hash / DE: Cache-Hash aktualisieren / RU: Обновляем хэш
    return this.hash; // EN: Return new hash / DE: Neuen Hash zurückgeben / RU: Возвращаем новый хэш
  }

  meetsDifficulty() { // EN: Check leading-zero target / DE: Führende Nullen prüfen / RU: Проверка префикса нулей
    const prefix = '0'.repeat(this.difficulty); // EN: Target prefix / DE: Zielpräfix / RU: Целевой префикс
    return this.hash.startsWith(prefix); // EN: True if satisfied / DE: True wenn erfüllt / RU: True если выполнено
  }

  mine(maxIterations = 1e7) { // EN: Brute-force nonce / DE: Nonce bruteforcen / RU: Перебор nonce
    const prefix = '0'.repeat(this.difficulty); // EN: Target / DE: Ziel / RU: Цель
    let it = 0; // EN: Iteration counter / DE: Iterationszähler / RU: Счётчик итераций
    while (!this.hash.startsWith(prefix)) { // EN: Loop until target / DE: Schleife bis Ziel / RU: Крутим до цели
      this.nonce++; // EN: Change nonce / DE: Nonce erhöhen / RU: Увеличиваем nonce
      this.recomputeHash(); // EN: Refresh hash / DE: Hash neu berechnen / RU: Пересчитываем хэш
      if (++it >= maxIterations) throw new Error('PoW: max iterations reached'); // EN: Safety stop / DE: Sicherheitsabbruch / RU: Стоп по лимиту
    }
    return this; // EN: Return mined block / DE: Geminten Block zurückgeben / RU: Вернуть добытый блок
  }
}

module.exports = Block; // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
```

```bash
git add block.js && git commit -m "feat(block): PoW block (difficulty/nonce) and mining"
```

---

## 5) Blockchain container (`blockchain.js`)

**Intent:** maintain a valid chain; create genesis; mine & append blocks; validate PoW and linkage.

Create `blockchain.js`:

```js
// blockchain.js — Simple chain with PoW mining // EN: Simple PoW chain / DE: Einfache PoW-Chain / RU: Простая цепь с PoW

const Block = require('./block'); // EN: Use Block class / DE: Block-Klasse nutzen / RU: Используем класс Block

class Blockchain { // EN: Chain container / DE: Ketten-Container / RU: Контейнер цепочки
  constructor({ difficulty = 3 } = {}) { // EN: Global difficulty / DE: Globale Difficulty / RU: Глобальная сложность
    this.difficulty = difficulty; // EN: Store difficulty / DE: Difficulty speichern / RU: Сохраняем сложность
    this.chain = [this.createGenesisBlock()]; // EN: Start with genesis / DE: Start mit Genesis / RU: Начинаем с генезиса
  }

  createGenesisBlock() { // EN: Build genesis block / DE: Genesis-Block erzeugen / RU: Создать генезис-блок
    const b = new Block({ index: 0, previousHash: '0'.repeat(64), timestamp: Date.now(), transactions: [], difficulty: this.difficulty, nonce: 0 }); // EN/DE/RU: Генезис без майнинга
    return b; // EN: Return genesis / DE: Genesis zurückgeben / RU: Вернуть генезис
  }

  latest() { return this.chain[this.chain.length - 1]; } // EN: Tail block / DE: Letzter Block / RU: Последний блок

  addBlock(block) { // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
    const tip = this.latest(); // EN: Current tip / DE: Aktuelle Spitze / RU: Текущая вершина
    if (block.index !== tip.index + 1) throw new Error('Bad index'); // EN: Height check / DE: Höhen-Check / RU: Проверка высоты
    if (block.previousHash !== tip.hash) throw new Error('Bad prevHash'); // EN: Link check / DE: Verknüpfungs-Check / RU: Проверка связи
    if (!block.meetsDifficulty()) throw new Error('Not mined'); // EN: PoW must hold / DE: PoW muss gelten / RU: Должен соблюдаться PoW
    if (block.computeHash() !== block.hash) throw new Error('Hash mismatch'); // EN: Integrity / DE: Integrität / RU: Целостность
    this.chain.push(block); // EN: Append / DE: Anhängen / RU: Добавляем
    return block; // EN: Return appended / DE: Zurückgeben / RU: Вернуть добавленный
  }

  mineBlock(transactions = []) { // EN: Build→mine→add / DE: Bauen→minen→hinzufügen / RU: Создать→майнить→добавить
    const block = new Block({ index: this.latest().index + 1, previousHash: this.latest().hash, timestamp: Date.now(), transactions, difficulty: this.difficulty, nonce: 0 }); // EN/DE/RU: Кандидат
    block.mine(); // EN: PoW loop / DE: PoW-Schleife / RU: Цикл PoW
    return this.addBlock(block); // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
  }

  isValid() { // EN: Full chain check / DE: Komplette Kettenprüfung / RU: Полная проверка цепи
    for (let i = 1; i < this.chain.length; i++) { // EN: Skip genesis / DE: Genesis überspringen / RU: Пропускаем генезис
      const prev = this.chain[i - 1]; const cur = this.chain[i]; // EN/DE/RU: Пара блоков
      if (cur.previousHash !== prev.hash) return false; // EN: Link ok? / DE: Link ok? / RU: Связь ок?
      if (!cur.meetsDifficulty()) return false; // EN: PoW ok? / DE: PoW ok? / RU: PoW ок?
      if (cur.computeHash() !== cur.hash) return false; // EN: Hash ok? / DE: Hash ok? / RU: Хэш ок?
    }
    return true; // EN: All good / DE: Alles gut / RU: Всё хорошо
  }
}

module.exports = Blockchain; // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
```

```bash
git add blockchain.js && git commit -m "feat(blockchain): genesis, mineBlock(), isValid()"
```

---

## 6) Smoke tests (`test-block.js`, `test-chain.js`)

**Intent:** quick verification without wiring a CLI.

Create `test-block.js`:

```js
const Block = require('./block'); // EN/DE/RU: Import Block
const b = new Block({ index: 1, previousHash: '00', timestamp: Date.now(), transactions: [], difficulty: 3 }); // EN/DE/RU: Кандидат
console.log('⛏ Mining...'); b.mine(); // EN/DE/RU: PoW
console.log('Hash:', b.hash); console.log('Nonce:', b.nonce); // EN/DE/RU: Результаты
```

Create `test-chain.js`:

```js
const Blockchain = require('./blockchain'); // EN/DE/RU: Import chain
const chain = new Blockchain({ difficulty: 3 }); // EN/DE/RU: Глобальная сложность
console.log('Genesis hash:', chain.latest().hash); // EN/DE/RU: Хэш генезиса
const txs = [ { from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 }, { from: '0xccc', to: '0xddd', amount: 7, nonce: 1 } ]; // EN/DE/RU: Тестовые txs
console.log('⛏ Mining block #1...'); const b1 = chain.mineBlock(txs); // EN/DE/RU: Майним
console.log('Mined hash:', b1.hash); console.log('Nonce:', b1.nonce); console.log('Chain valid?', chain.isValid()); // EN/DE/RU: Проверка
```

```bash
node test-block.js && node test-chain.js
git add test-block.js test-chain.js && git commit -m "test: add PoW and chain smoke tests"
```

---

## 7) Commits & Project hygiene

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

## 8) Next steps

* Integrate real mempool selection into `mineBlock()` (valid txs, size/weight limit).
* Add balances/state (account model or simple UTXO), prevent overspending.
* P2P sync (peers, block propagation), basic explorer.
* Solidity + Remix VM: first contracts, local deployment pipeline.

---

## 9) Changelog
- **28.08.2025 (Day 1):** Created repo `my-blockchain`, added `transaction.js` (keys, tx, signature, mempool).  
- **30.08.2025 (Day 3):** Added `utils.js` (sha256Hex, serializeTx, serializeHeader, simpleTxRoot).  
- **01.09.2025 (Day 5):** Added `block.js` (difficulty, PoW mining).  
- **02.09.2025 (Day 6):** Added `blockchain.js` (genesis, mineBlock, isValid).  
- **03.09.2025 (Day 7):** Created `DIARY.md` (portfolio edition).  

---

## 10) PR-plan
- [ ] Refactor `transaction.js` to import all helpers from `utils.js`.  
- [ ] Connect mempool → `mineBlock()` (mine blocks with real pending txs).  
- [ ] Add balances/state validation (prevent double spending).  
- [ ] Extend tests (Jest/Mocha or Node assert).  
- [ ] Enhance README with usage examples & screenshots.  
- [ ] Export PDF version of `DIARY.md` for portfolio.  


> Keep commits small and meaningful. This diary grows as features land — append new steps with dates.
