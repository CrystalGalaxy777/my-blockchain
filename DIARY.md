# DIARY.md — my-blockchain (Portfolio Edition)

**Repo:** `my-blockchain`  
**Date:** 2025-09-12  
**Goal:** Build a minimal Proof-of-Work blockchain (JS/Node) with transactions, signatures, mempool, blocks, chain validation.

> This diary is written as a **reproducible build log**. Follow the steps to recreate the project from scratch.  
> Code comments are **inline** and **tri-lingual**: `// EN / DE / RU`.

---

## Table of Contents
1. [Create the repository](#1-create-the-repository)  
2. [Utilities: crypto & serialization (`utils.js`)](#2-utilities-crypto--serialization-utilsjs)  
3. [Transactions, signatures, mempool (`transaction.js` + `tx-crypto.js`)](#3-transactions-signatures-mempool-transactionjs--tx-cryptojs)  
4. [Block with PoW mining (`block.js`)](#4-block-with-pow-mining-blockjs)  
5. [Blockchain container (`blockchain.js`)](#5-blockchain-container-blockchainjs)  
6. [Mempool integration (`mineFromMempool`)](#6-mempool-integration-minefrommempool)  
7. [Smoke tests (`test-block.js`, `test-chain.js`)](#7-smoke-tests-test-blockjs-test-chainjs)  
8. [Proof-of-Work demo (`pow-demo.js`)](#8-proof-of-work-demo-pow-demojs)  
9. [Basic unit tests (`test/basic.test.js`)](#9-basic-unit-tests-testbasictestjs)  
10. [Commits & Project hygiene](#10-commits--project-hygiene)  
11. [Next steps](#11-next-steps)  
12. [Changelog](#12-changelog)  
13. [PR-plan](#13-pr-plan)

---

## 1) Create the repository

**Intent:** clean, professional init; minimal noise.

```bash
mkdir my-blockchain && cd my-blockchain                    # EN: Create folder / DE: Ordner erstellen / RU: Создать папку
git init                                                   # EN: Init repo / DE: Repo initialisieren / RU: Инициализировать репо
echo "# My Blockchain Learning (JS)" > README.md           # EN: Seed README / DE: README anlegen / RU: Создать README
node -v && npm -v                                          # EN: Verify toolchain / DE: Toolchain prüfen / RU: Проверить версии
npm init -y                                                # EN: Create package.json / DE: package.json erzeugen / RU: Создать package.json
git add . && git commit -m "chore: init repository"        # EN: First commit / DE: Erster Commit / RU: Первый коммит
````

Optional: add a remote and push.

---

## 2) Utilities: crypto & serialization (`utils.js`)

**Intent:** one place for hashing and deterministic JSON reused by tx/block/chain.

Create `utils.js`:

```js
const crypto = require('crypto');                                                             // EN: Import Node crypto / DE: Node-Krypto importieren / RU: Импортируем модуль crypto

function sha256Hex(data) {                                                                    // EN: SHA-256 to hex / DE: SHA-256 nach Hex / RU: SHA-256 в hex
  return crypto.createHash('sha256').update(data).digest('hex');                              // EN: Compute digest / DE: Digest berechnen / RU: Вычисляем дайджест
}                                                                                             // EN / DE / RU

function serializeTx(tx) {                                                                    // EN: Canonical tx JSON / DE: Kanonisches Tx-JSON / RU: Каноничный JSON транзакции
  const ordered = { from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce };           // EN: Fixed field order / DE: Feste Feldreihenfolge / RU: Фиксированный порядок полей
  return JSON.stringify(ordered);                                                             // EN: Stable string / DE: Stabile Zeichenkette / RU: Стабильная строка
}                                                                                             // EN / DE / RU

function serializeHeader(h) {                                                                 // EN: Canonical block header / DE: Kanonischer Block-Header / RU: Каноничный заголовок блока
  const ordered = { index: h.index, previousHash: h.previousHash, timestamp: h.timestamp,     // EN: Keep order stable / DE: Reihenfolge stabil halten / RU: Сохраняем порядок полей
                    txRoot: h.txRoot, difficulty: h.difficulty, nonce: h.nonce };             // EN: Header fields / DE: Header-Felder / RU: Поля заголовка
  return JSON.stringify(ordered);                                                             // EN: Stable string / DE: Stabile Zeichenkette / RU: Стабильная строка
}                                                                                             // EN / DE / RU

function simpleTxRoot(transactions) {                                                         // EN: Simple list-hash (not Merkle) / DE: Einfacher Listen-Hash (kein Merkle) / RU: Простой хэш списка (не Меркле)
  const normalized = transactions.map(t => JSON.parse(serializeTx(t)));                       // EN: Normalize items / DE: Items normalisieren / RU: Нормализуем элементы
  return sha256Hex(JSON.stringify(normalized));                                               // EN: Hash normalized JSON / DE: Normalisiertes JSON hashen / RU: Хэш нормализованного JSON
}                                                                                             // EN / DE / RU

module.exports = { sha256Hex, serializeTx, serializeHeader, simpleTxRoot };                   // EN: Export helpers / DE: Helfer exportieren / RU: Экспорт утилит
```

Commit:

```bash
git add utils.js && git commit -m "feat(utils): sha256Hex/serializeTx/serializeHeader/simpleTxRoot"
```

---

## 3) Transactions, signatures, mempool (`transaction.js` + `tx-crypto.js`)

**Intent:** show pure crypto helpers first, then a tx demo that signs/verifies and inserts into the mempool.

Create `tx-crypto.js`:

```js
const crypto = require('crypto');                                                             // EN: Node crypto / DE: Node-Krypto / RU: Модуль crypto

function serializeTx(tx) {                                                                    // EN: Deterministic tx JSON / DE: Deterministisches Tx-JSON / RU: Детерминированный JSON транзакции
  const ordered = { from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce };           // EN: Canonical fields / DE: Kanonische Felder / RU: Каноничные поля
  return JSON.stringify(ordered);                                                             // EN: Stable string / DE: Stabile Zeichenkette / RU: Стабильная строка
}                                                                                             // EN / DE / RU

function sha256(data) {                                                                       // EN: SHA-256 helper / DE: SHA-256-Helfer / RU: Хелпер SHA-256
  return crypto.createHash('sha256').update(data).digest('hex');                              // EN: Digest hex / DE: Hex-Digest / RU: Hex-дайджест
}                                                                                             // EN / DE / RU

function signTx(txJson, privateKeyPem) {                                                      // EN: Sign JSON payload / DE: JSON-Payload signieren / RU: Подписать JSON-представление
  const s = crypto.createSign('SHA256'); s.update(txJson); s.end();                           // EN: Feed signer / DE: Signierer füttern / RU: Подать данные подписанту
  return s.sign(privateKeyPem, 'hex');                                                        // EN: Return hex signature / DE: Hex-Signatur zurückgeben / RU: Возвращаем hex-подпись
}                                                                                             // EN / DE / RU

function verifyTx(txJson, signatureHex, publicKeyPem) {                                       // EN: Verify signature / DE: Signatur prüfen / RU: Проверить подпись
  const v = crypto.createVerify('SHA256'); v.update(txJson); v.end();                         // EN: Feed verifier / DE: Prüfer füttern / RU: Подать данные проверяющему
  return v.verify(publicKeyPem, signatureHex, 'hex');                                         // EN: true if valid / DE: true wenn gültig / RU: true если корректна
}                                                                                             // EN / DE / RU

function toAddress(publicKeyPem) {                                                            // EN: Short address from pubkey / DE: Kurzadresse aus Pubkey / RU: Короткий адрес из pubkey
  const hash = sha256(publicKeyPem);                                                          // EN: Hash PEM / DE: PEM hashen / RU: Хэш PEM
  return '0x' + hash.slice(0, 40);                                                            // EN: First 20 bytes hex / DE: Erste 20 Bytes Hex / RU: Первые 20 байт hex
}                                                                                             // EN / DE / RU

module.exports = { serializeTx, sha256, signTx, verifyTx, toAddress };                        // EN: Export API / DE: API exportieren / RU: Экспорт API
```

Commit:

```bash
git add tx-crypto.js && git commit -m "feat(tx-crypto): serializeTx/sha256/signTx/verifyTx/toAddress"
```

Create `mempool.js` (used by the tx demo):

```js
class Mempool {                                                                               // EN: Pending tx container / DE: Container für ausstehende Txs / RU: Контейнер неподтверждённых tx
  constructor(validator = null, maxSize = 1000) { this._items = []; this._validator = validator; this._maxSize = maxSize; } // EN: Init fields / DE: Felder init / RU: Инициализация полей
  size() { return this._items.length; }                                                       // EN: Current count / DE: Aktuelle Anzahl / RU: Текущее количество
  _isDup(tx) { return this._items.some(e => e.tx.from === tx.from && e.tx.nonce === tx.nonce); } // EN: Duplicate check / DE: Duplikatprüfung / RU: Проверка дублей
  add(tx, signature = null, pubKey = null) {                                                  // EN: Add with validation / DE: Hinzufügen mit Validierung / RU: Добавить с проверкой
    if (this.size() >= this._maxSize) throw new Error('Mempool full');                        // EN: Capacity guard / DE: Kapazitätsgrenze / RU: Переполнение мемпула
    if (this._isDup(tx)) throw new Error('Duplicate (from, nonce) in mempool');               // EN: No duplicates / DE: Keine Duplikate / RU: Запрет дублей
    if (this._validator && !this._validator(tx, signature, pubKey)) throw new Error('Validation failed'); // EN: External validator / DE: Externer Validator / RU: Внешний валидатор
    this._items.push({ tx, signature, pubKey }); return this.size();                           // EN: Store item / DE: Element speichern / RU: Сохраняем элемент
  }                                                                                            // EN / DE / RU
  takeAll(maxCount = Infinity) { const cut = this._items.splice(0, Math.min(maxCount, this.size())); return cut.map(e => e.tx); } // EN: Drain N / DE: N entnehmen / RU: Забрать N
  peekAll() { return this._items.map(e => ({ ...e })); }                                      // EN: Read-only snapshot / DE: Schnappschuss / RU: Снимок списка
  clear() { this._items.length = 0; }                                                         // EN: Clear pool / DE: Pool leeren / RU: Очистить пул
}                                                                                             // EN / DE / RU
module.exports = Mempool;                                                                      // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
```

Commit:

```bash
git add mempool.js && git commit -m "feat(mempool): class with validator and duplicate checks"
```

Create `transaction.js`:

```js
const crypto = require('crypto');                                                             // EN: Node crypto / DE: Node-Krypto / RU: Модуль crypto
const { serializeTx, sha256, signTx, verifyTx, toAddress } = require('./tx-crypto');         // EN: Pure helpers / DE: Reine Helfer / RU: Чистые хелперы
const Mempool = require('./mempool');                                                         // EN: Mempool class / DE: Mempool-Klasse / RU: Класс мемпула

const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {                          // EN: Generate ECDSA keys / DE: ECDSA-Schlüssel erzeugen / RU: Сгенерировать ключи ECDSA
  namedCurve: 'secp256k1', publicKeyEncoding: { type: 'spki', format: 'pem' },               // EN: secp256k1 + pub PEM / DE: secp256k1 + Pub-PEM / RU: secp256k1 + публичный PEM
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }                                        // EN: Private PEM / DE: Privater PEM / RU: Приватный PEM
});                                                                                           // EN / DE / RU

const address = toAddress(publicKey);                                                         // EN: Short sender address / DE: Kurzadresse / RU: Короткий адрес
const tx = { from: address, to: '0x96a23e4cd1fdea96c571cadfe6b5318abcee84cc', amount: 100, nonce: 1 }; // EN: Demo tx / DE: Demo-Tx / RU: Демонстрационная tx
const txJson = serializeTx(tx);                                                               // EN: Canonical JSON / DE: Kanonisches JSON / RU: Каноничный JSON
const txHash = sha256(txJson);                                                                // EN: Fingerprint / DE: Fingerabdruck / RU: Отпечаток
const signature = signTx(txJson, privateKey);                                                 // EN: Sign tx / DE: Tx signieren / RU: Подписать tx

function txValidator(obj, sigHex, pubPem) {                                                   // EN: Validator: signature+address / DE: Validator: Signatur+Adresse / RU: Валидатор: подпись+адрес
  const json = serializeTx(obj); if (!verifyTx(json, sigHex, pubPem)) return false;           // EN: Verify signature / DE: Signatur prüfen / RU: Проверка подписи
  return obj.from === toAddress(pubPem);                                                      // EN: from must match pubkey / DE: from muss zum Pubkey passen / RU: from должен совпадать с pubkey
}                                                                                             // EN / DE / RU

const mempool = new Mempool(txValidator, 1000);                                               // EN: Create mempool / DE: Mempool erstellen / RU: Создать мемпул
try { mempool.add(tx, signature, publicKey); } catch (e) { console.log('Mempool reject:', e.message); } // EN: Insert tx / DE: Tx einfügen / RU: Добавить tx

console.log('Address:', address);                                                             // EN: Print address / DE: Adresse ausgeben / RU: Печать адреса
console.log('TX JSON:', txJson); console.log('TX Hash:', txHash);                             // EN: Print JSON+hash / DE: JSON+Hash ausgeben / RU: Печать JSON+хэша
console.log('Signature (hex):', signature.slice(0, 48) + '…');                                // EN: Preview signature / DE: Signatur-Vorschau / RU: Превью подписи
console.log('Valid signature?', verifyTx(txJson, signature, publicKey));                      // EN: Expect true / DE: true erwartet / RU: ожидаем true
const tampered = { ...tx, amount: 9999 };                                                     // EN: Mutate amount / DE: Betrag ändern / RU: Изменить сумму
console.log('Valid after tamper?', verifyTx(serializeTx(tampered), signature, publicKey));    // EN: Expect false / DE: false erwartet / RU: ожидаем false
console.log('Mempool size:', mempool.size());                                                 // EN: Should be 1 / DE: Sollte 1 sein / RU: Должно быть 1

module.exports = { serializeTx, sha256, signTx, verifyTx, toAddress, mempool };               // EN: Export API / DE: API exportieren / RU: Экспорт API
```

Commit:

```bash
git add transaction.js && git commit -m "feat(tx): signing/verification + insert into validated mempool"
```

---

## 4) Block with PoW mining (`block.js`)

**Intent:** minimal header + PoW; valid if `hash` starts with `difficulty` zeros.

Create `block.js`:

```js
const { sha256Hex, serializeHeader, simpleTxRoot } = require('./utils');                      // EN: Import helpers / DE: Helfer importieren / RU: Импорт хелперов

class Block {                                                                                 // EN: Block model / DE: Block-Modell / RU: Модель блока
  constructor({ index, previousHash, timestamp, transactions, difficulty = 2, nonce = 0 }) {  // EN: Init fields / DE: Felder initialisieren / RU: Инициализировать поля
    this.index = index;                                                                       // EN: Height / DE: Höhe / RU: Высота
    this.previousHash = previousHash;                                                         // EN: Parent hash / DE: Vorgänger-Hash / RU: Хэш родителя
    this.timestamp = timestamp;                                                               // EN: Unix ms / DE: Unix ms / RU: Unix мс
    this.transactions = transactions;                                                         // EN: Payload / DE: Nutzlast / RU: Полезная нагрузка
    this.txRoot = simpleTxRoot(transactions);                                                 // EN: Deterministic root / DE: Deterministische Wurzel / RU: Детерм. корень
    this.difficulty = difficulty;                                                             // EN: PoW zeros / DE: PoW-Nullen / RU: Нули PoW
    this.nonce = nonce;                                                                       // EN: Mining counter / DE: Mining-Zähler / RU: Счётчик майнинга
    this.hash = this.computeHash();                                                           // EN: Initial header hash / DE: Initialer Header-Hash / RU: Начальный хэш заголовка
  }                                                                                           // EN / DE / RU

  header() { return { index: this.index, previousHash: this.previousHash, timestamp: this.timestamp, txRoot: this.txRoot, difficulty: this.difficulty, nonce: this.nonce }; } // EN: Header object / DE: Header-Objekt / RU: Объект заголовка
  computeHash() { return sha256Hex(serializeHeader(this.header())); }                         // EN: Hash header / DE: Header hashen / RU: Хэш заголовка
  recomputeHash() { this.hash = this.computeHash(); return this.hash; }                       // EN: Refresh hash / DE: Hash aktualisieren / RU: Пересчитать хэш
  meetsDifficulty() { const p = '0'.repeat(this.difficulty); return this.hash.startsWith(p); } // EN: Check PoW / DE: PoW prüfen / RU: Проверить PoW

  mine(maxIterations = 1e7) {                                                                 // EN: Brute-force nonce / DE: Nonce bruteforcen / RU: Перебор nonce
    const p = '0'.repeat(this.difficulty); let it = 0;                                        // EN: Target prefix / DE: Zielpräfix / RU: Целевой префикс
    while (!this.hash.startsWith(p)) { this.nonce++; this.recomputeHash(); if (++it >= maxIterations) throw new Error('PoW: max iterations reached'); } // EN: Loop with guard / DE: Schleife mit Limit / RU: Цикл с ограничением
    return this;                                                                              // EN: Return mined block / DE: Geminten Block zurück / RU: Вернуть добытый блок
  }                                                                                           // EN / DE / RU
}                                                                                             // EN / DE / RU

module.exports = Block;                                                                       // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
```

Commit:

```bash
git add block.js && git commit -m "feat(block): PoW block (difficulty/nonce) + mining"
```

---

## 5) Blockchain container (`blockchain.js`)

**Intent:** manage chain; genesis; add/mine blocks; validate PoW and linkage.

Create `blockchain.js`:

```js
const Block = require('./block');                                                             // EN: Use Block / DE: Block nutzen / RU: Используем Block

class Blockchain {                                                                            // EN: Chain container / DE: Ketten-Container / RU: Контейнер цепочки
  constructor({ difficulty = 3 } = {}) { this.difficulty = difficulty; this.chain = [this.createGenesisBlock()]; } // EN: Store diff + genesis / DE: Diff + Genesis / RU: Сложность + генезис
  createGenesisBlock() { return new Block({ index: 0, previousHash: '0'.repeat(64), timestamp: Date.now(), transactions: [], difficulty: this.difficulty, nonce: 0 }); } // EN: Genesis block / DE: Genesis-Block / RU: Генезис-блок
  latest() { return this.chain[this.chain.length - 1]; }                                      // EN: Tip block / DE: Spitzenblock / RU: Верхний блок

  addBlock(block) {                                                                           // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
    const tip = this.latest();                                                                // EN: Current tip / DE: Aktuelle Spitze / RU: Текущая вершина
    if (block.index !== tip.index + 1) throw new Error('Bad index');                          // EN: Height check / DE: Höhenprüfung / RU: Проверка высоты
    if (block.previousHash !== tip.hash) throw new Error('Bad prevHash');                     // EN: Link check / DE: Verknüpfung prüfen / RU: Проверка ссылки
    if (!block.meetsDifficulty()) throw new Error('Not mined');                               // EN: PoW must hold / DE: PoW muss gelten / RU: Должен соблюдаться PoW
    if (block.computeHash() !== block.hash) throw new Error('Hash mismatch');                 // EN: Integrity check / DE: Integritätsprüfung / RU: Проверка целостности
    this.chain.push(block); return block;                                                     // EN: Append / DE: Anhängen / RU: Добавить
  }                                                                                           // EN / DE / RU

  mineBlock(transactions = []) {                                                              // EN: Build → mine → append / DE: Bauen → minen → anhängen / RU: Собрать → майнить → добавить
    const b = new Block({ index: this.latest().index + 1, previousHash: this.latest().hash, timestamp: Date.now(), transactions, difficulty: this.difficulty, nonce: 0 }); // EN: Candidate / DE: Kandidat / RU: Кандидат
    b.mine(); return this.addBlock(b);                                                        // EN: PoW then add / DE: PoW dann hinzufügen / RU: Сначала PoW, затем добавить
  }                                                                                           // EN / DE / RU

  mineFromMempool(mempool, maxTx = Infinity) { if (!mempool || typeof mempool.takeAll !== 'function') throw new Error('mineFromMempool: mempool with takeAll() is required'); const txs = mempool.takeAll(maxTx); return this.mineBlock(txs); } // EN: Mine using mempool / DE: Aus Mempool minen / RU: Майним из мемпула

  isValid() { for (let i = 1; i < this.chain.length; i++) { const prev = this.chain[i - 1], cur = this.chain[i]; if (cur.previousHash !== prev.hash) return false; if (!cur.meetsDifficulty()) return false; if (cur.computeHash() !== cur.hash) return false; } return true; } // EN: Full chain check / DE: Komplette Kettenprüfung / RU: Полная проверка цепи
}                                                                                             // EN / DE / RU

module.exports = Blockchain;                                                                  // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
```

Commit:

```bash
git add blockchain.js && git commit -m "feat(blockchain): genesis, mineBlock(), isValid(), mineFromMempool()"
```

---

## 6) Mempool integration (`mineFromMempool`)

**Intent:** mine real blocks from pending transactions (shared mempool or standalone).

Create `mine-from-transaction.js` (shared mempool):

```js
const Blockchain = require('./blockchain');                                                   // EN: Chain class / DE: Kettenklasse / RU: Класс цепочки
const { mempool } = require('./transaction');                                                 // EN: Reuse tx demo mempool / DE: Mempool wiederverwenden / RU: Повторно используем мемпул

const chain = new Blockchain({ difficulty: 2 });                                              // EN: Easier PoW for demo / DE: Leichtere PoW / RU: Проще PoW
console.log('⛏ Mining from mempool...');                                                     // EN: Start message / DE: Startmeldung / RU: Старт
const b1 = chain.mineFromMempool(mempool);                                                    // EN: Mine using mempool / DE: Aus Mempool minen / RU: Майним из мемпула
console.log('Mined block hash:', b1.hash); console.log('Nonce:', b1.nonce);                   // EN: Show results / DE: Ergebnisse anzeigen / RU: Показать результаты
console.log('Tx count in block:', b1.transactions.length);                                    // EN: Count txs / DE: Anzahl Txs / RU: Кол-во tx
console.log('Chain valid?', chain.isValid());                                                 // EN: Validate chain / DE: Kette validieren / RU: Проверить цепь
```

Create `test-mine-mempool.js` (standalone mempool):

```js
const Blockchain = require('./blockchain');                                                   // EN: Import chain / DE: Kette importieren / RU: Импорт цепочки
const Mempool = require('./mempool');                                                         // EN: Import mempool / DE: Mempool importieren / RU: Импорт мемпула

const mempool = new Mempool(null, 1000);                                                      // EN: No validator (demo) / DE: Kein Validator / RU: Без валидатора
mempool.add({ from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 });                             // EN: Tx #1 / DE: Tx #1 / RU: Tx #1
mempool.add({ from: '0xccc', to: '0xddd', amount: 7, nonce: 1 });                             // EN: Tx #2 / DE: Tx #2 / RU: Tx #2

console.log('Mempool size before mining:', mempool.size());                                   // EN: Before mining / DE: Vor dem Mining / RU: До майнинга
const chain = new Blockchain({ difficulty: 2 });                                              // EN: Easier PoW / DE: Leichtere PoW / RU: Проще PoW
console.log('⛏ Mining from mempool...');                                                     // EN: Start / DE: Start / RU: Старт
const block = chain.mineFromMempool(mempool);                                                 // EN: Mine using mempool / DE: Aus Mempool minen / RU: Майним из мемпула

console.log('Mined hash:', block.hash); console.log('Nonce:', block.nonce);                   // EN: Output block data / DE: Blockdaten ausgeben / RU: Данные блока
console.log('Tx count in block:', block.transactions.length);                                 // EN: Transactions in block / DE: Transaktionen im Block / RU: Транзакций в блоке
console.log('Mempool size after mining:', mempool.size());                                    // EN: After mining / DE: Nach dem Mining / RU: После майнинга
console.log('Chain valid?', chain.isValid());                                                 // EN: Validate / DE: Validieren / RU: Проверка
```

Commit:

```bash
git add mine-from-transaction.js test-mine-mempool.js && git commit -m "feat(demo): integrate mempool with mining"
```

---

## 7) Smoke tests (`test-block.js`, `test-chain.js`)

**Intent:** quick check without frameworks.

Create `test-block.js`:

```js
const Block = require('./block');                                                             // EN: Import Block / DE: Block importieren / RU: Импорт Block
const b = new Block({ index: 1, previousHash: '00', timestamp: Date.now(), transactions: [], difficulty: 3 }); // EN: Candidate / DE: Kandidat / RU: Кандидат
console.log('⛏ Mining...'); b.mine();                                                        // EN: Mine now / DE: Jetzt minen / RU: Майнить
console.log('Hash:', b.hash); console.log('Nonce:', b.nonce);                                 // EN: Show result / DE: Ergebnis anzeigen / RU: Показать результат
```

Create `test-chain.js`:

```js
const Blockchain = require('./blockchain');                                                   // EN: Import Blockchain / DE: Blockchain importieren / RU: Импорт Blockchain
const chain = new Blockchain({ difficulty: 3 });                                              // EN: Global difficulty / DE: Globale Difficulty / RU: Глобальная сложность
console.log('Genesis hash:', chain.latest().hash);                                            // EN: Show genesis hash / DE: Genesis-Hash anzeigen / RU: Хэш генезиса
const txs = [ { from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 }, { from: '0xccc', to: '0xddd', amount: 7, nonce: 1 } ]; // EN: Demo txs / DE: Demo-Txs / RU: Демонстрационные tx
console.log('⛏ Mining block #1...'); const b1 = chain.mineBlock(txs);                        // EN: Mine a block / DE: Block minen / RU: Майним блок
console.log('Mined hash:', b1.hash); console.log('Nonce:', b1.nonce);                         // EN: Output / DE: Ausgabe / RU: Вывод
console.log('Chain valid?', chain.isValid());                                                 // EN: Validate chain / DE: Kette validieren / RU: Проверка цепи
```

Commit:

```bash
git add test-block.js test-chain.js && git commit -m "test: PoW and chain smoke tests"
```

---

## 8) Proof-of-Work demo (`pow-demo.js`)

**Intent:** visualize PoW speed and parameters (difficulty, logging, stability).

Create `pow-demo.js`:

```js
const Block = require('./block');                                                             // EN: Import Block / DE: Block importieren / RU: Импорт Block
const argv = process.argv.slice(2);                                                           // EN: Grab CLI args / DE: CLI-Argumente holen / RU: Получаем аргументы CLI
const hasFlag = f => argv.includes(f) || argv.includes(f.replace('--','-'));                  // EN: Flag alias support / DE: Flag-Aliase / RU: Поддержка алиасов флагов
const num = (name, def) => { const i = argv.findIndex(a => a === name || a === name.replace('--','-')); return (i>=0 && argv[i+1] && !argv[i+1].startsWith('-')) ? Number(argv[i+1]) : def; }; // EN: Numeric flag / DE: Numerischer Flag / RU: Числовой флаг

const difficulty = num('--difficulty', 3);                                                    // EN: Mining difficulty / DE: Mining-Schwierigkeit / RU: Сложность майнинга
const maxIter = num('--maxIter', 1e7);                                                        // EN: Safety limit / DE: Sicherheitslimit / RU: Лимит безопасности
const logEvery = num('--logEvery', 50000);                                                    // EN: Progress step / DE: Fortschrittsschritt / RU: Шаг прогресса
const timestampStable = hasFlag('--timestampStable') || hasFlag('-t');                        // EN: Fixed timestamp / DE: Fester Zeitstempel / RU: Фиксированный таймстемп
const noSpinner = hasFlag('--noSpinner');                                                     // EN: Disable spinner / DE: Spinner deaktivieren / RU: Отключить спиннер

console.log(`Params → difficulty=${difficulty}, maxIter=${maxIter}, logEvery=${logEvery}, timestampStable=${timestampStable}`); // EN: Echo params / DE: Parameter ausgeben / RU: Печать параметров

const fixedTs = Date.now();                                                                   // EN: Capture start time / DE: Startzeit erfassen / RU: Фиксируем время
const b = new Block({ index: 1, previousHash: '00', timestamp: (timestampStable?fixedTs:Date.now()), transactions: [], difficulty, nonce: 0 }); // EN: Candidate / DE: Kandidat / RU: Кандидат

const frames = ['|','/','-','\\']; let spin = 0; let spinner;                                 // EN: Spinner frames / DE: Spinner-Frames / RU: Кадры спиннера
if (!noSpinner) spinner = setInterval(() => process.stdout.write(`\r${frames[spin=(spin+1)%frames.length]} mining… nonce=${b.nonce}`), 80); // EN: Animate / DE: Animieren / RU: Анимировать

let attempts = 0; const prefix = '0'.repeat(difficulty); const t0 = Date.now();               // EN: Counters / DE: Zähler / RU: Счётчики
console.log('\n⛏ Mining…');                                                                   // EN: Start / DE: Start / RU: Старт
while (!b.hash.startsWith(prefix)) { b.nonce++; b.recomputeHash(); attempts++; if (attempts % logEvery === 0) process.stdout.write(`\r… attempts=${attempts}, nonce=${b.nonce}`); if (attempts >= maxIter) { if (spinner) clearInterval(spinner); console.error(`\n❌ Gave up after ${attempts}`); process.exit(1); } } // EN: Mining loop / DE: Mining-Schleife / RU: Цикл майнинга
if (spinner) clearInterval(spinner); process.stdout.write('\r');                               // EN: Stop spinner / DE: Spinner stoppen / RU: Остановить спиннер

const t1 = Date.now(); const elapsed = (t1 - t0)/1000; const rate = Math.floor(attempts/(elapsed||1)); // EN: Metrics / DE: Metriken / RU: Метрики
console.log('✅ Mined!'); console.log('Hash:', b.hash); console.log('Nonce:', b.nonce); console.log('Attempts:', attempts); // EN: Output / DE: Ausgabe / RU: Вывод
console.log(`Time: ${elapsed.toFixed(2)} s`); console.log(`Rate≈ ${rate}/s`); console.log(`Timestamp: ${b.timestamp} (stable=${timestampStable})`); // EN: Summary / DE: Zusammenfassung / RU: Итог
```

Commit:

```bash
git add pow-demo.js && git commit -m "feat(cli): PoW demo with flags and spinner"
```

---

## 9) Basic unit tests (`test/basic.test.js`)

**Intent:** sanity checks for helpers, fully deterministic.

Create `test/basic.test.js`:

```js
const assert = require('assert');                                                             // EN: Node assert / DE: Node-Assert / RU: Встроенный assert
const crypto = require('crypto');                                                             // EN: Node crypto / DE: Node-Krypto / RU: Крипто
const { serializeTx, sha256 } = require('../tx-crypto.js');                                   // EN: Import helpers / DE: Helfer importieren / RU: Импорт хелперов

const tx = { from: 'a', to: 'b', amount: 10, nonce: 1 };                                      // EN: Minimal tx / DE: Minimale Tx / RU: Минимальная tx
const ser = serializeTx(tx);                                                                   // EN: Canonical JSON / DE: Kanonisches JSON / RU: Каноничный JSON
assert.strictEqual(ser, JSON.stringify({ from:'a', to:'b', amount:10, nonce:1 }), 'serializeTx() must be deterministic'); // EN: Determinism / DE: Determinismus / RU: Детерминизм

const nodeHash = crypto.createHash('sha256').update('test').digest('hex');                    // EN: Reference hash / DE: Referenz-Hash / RU: Эталонный хэш
const helperHash = sha256('test');                                                            // EN: Helper hash / DE: Helfer-Hash / RU: Хэш хелпера
assert.strictEqual(helperHash, nodeHash, 'sha256() must match Node crypto output');           // EN: Must match / DE: Muss übereinstimmen / RU: Должен совпасть
assert.strictEqual(helperHash.length, 64, 'sha256() must return 64 hex chars');               // EN: 64 hex chars / DE: 64 Hex-Zeichen / RU: 64 hex-символа

const txWithExtra = { ...tx, foo: 123, bar: 'x' };                                            // EN: Extra fields / DE: Extra-Felder / RU: Лишние поля
assert.strictEqual(serializeTx(txWithExtra), ser, 'serializeTx() must ignore unspecified fields'); // EN: Ignore extras / DE: Extras ignorieren / RU: Игнор лишних

console.log('✅ All basic tests passed');                                                      // EN: Done / DE: Fertig / RU: Готово
```

Commit and run:

```bash
git add test/basic.test.js && git commit -m "test: basic utils & serialization checks"
node test/basic.test.js
```

---

## 10) Commits & Project hygiene

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

## 11) Next steps

1. Integrate real mempool selection into `mineBlock()` (valid txs, size/weight limit)

   * **Acceptance:** `mineBlock()` pulls pending txs from the mempool (e.g., `mempool.takeAll(limit)`), enforces a `BLOCK_TX_LIMIT` (or byte-size limit), and includes only validator-approved txs. A test proves: mempool size decreases, block contains ≤ limit, chain stays valid.

2. Add balances/state (account model or simple UTXO), prevent overspending

   * **Option A (Accounts):** balances map `{address -> number}`; reject tx if `balance[from] < amount`; update balances when block is added.
   * **Option B (UTXO):** maintain unspent outputs; build inputs/outputs; reject double-spends.
   * **Acceptance:** overspend txs are rejected before mempool insert; state transitions are deterministic and chain-valid.

3. P2P sync (peers, block propagation), basic explorer

   * Minimal peer protocol: broadcast new tx/block; receive and validate; resolve conflicts via Longest-Chain (or most-work) rule.
   * Basic explorer/CLI: list latest blocks/txs; show balances or UTXOs.
   * **Acceptance:** two local nodes converge to the same tip after independent mining; simple UI/CLI displays chain state.

4. Solidity + Remix VM: first contracts, local deployment pipeline

   * Write a tiny Solidity contract; compile & deploy locally (Remix or Hardhat); add a script/README notes to reproduce.
   * **Acceptance:** contract compiles, deploys, and a simple call/tx succeeds locally; steps are documented.

---

## 12) Changelog

* **28.08.2025 (Day 1):** Created repo `my-blockchain`, added `transaction.js` (keys, tx, signature, mempool).
* **30.08.2025 (Day 3):** Added `utils.js` (sha256Hex, serializeTx, serializeHeader, simpleTxRoot).
* **01.09.2025 (Day 5):** Added `block.js` (difficulty, PoW mining).
* **02.09.2025 (Day 6):** Added `blockchain.js` (genesis, mineBlock, isValid).
* **03.09.2025 (Day 7):** Created `DIARY.md` (portfolio edition).
* **10.09.2025 (Day 12):** Introduced `tx-crypto.js` and `mempool.js`; updated `transaction.js`.
* **11.09.2025 (Day 13):** Implemented `mineFromMempool()` and integration demos.
* **12.09.2025 (Day 14):** Basic unit tests and CLI PoW demo.

---

## 13) PR-plan

* [ ] **Refactor:** stabilize `transaction.js` as a demo-only script; keep all crypto helpers in `tx-crypto.js` and `utils.js`.
* [ ] **Integrate:** add `mineFromMempool()` to `Blockchain` (already implemented) → cover with `test-mine-mempool.js`.
* [ ] **Feature:** implement miner reward (coinbase transaction) in each mined block.
* [ ] **Feature:** introduce account balances and reject overspending before inserting a transaction into the mempool.
* [ ] **Tests:** extend coverage (Node assert / Jest) to verify:

  * duplicate (from, nonce) detection in mempool,
  * correct miner reward,
  * rejection of overspending transactions.
* [ ] **P2P:** simulate multiple nodes, implement block/tx propagation and Longest Chain Rule.
* [ ] **DX:** improve README/ROADMAP/DIARY with more examples, screenshots, and consistent structure.
* [ ] **Explorer:** add CLI or minimal HTTP API for chain inspection.
* [ ] **Solidity:** start with a simple smart contract in Remix VM and document the process in `DIARY.md`.

