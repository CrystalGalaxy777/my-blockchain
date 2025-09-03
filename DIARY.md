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

const crypto = require('crypto');                       // EN: Import Node.js crypto / DE: Node.js-Krypto importieren / RU: Подключаем модуль crypto

function sha256Hex(data) {                              // EN: SHA-256 wrapper / DE: SHA-256-Hülle / RU: Обёртка для SHA-256
  return crypto.createHash('sha256').update(data).digest('hex'); // EN: Hash to hex / DE: Hash als Hex / RU: Хэш в hex
}

function serializeTx(tx) {                              // EN: Deterministic tx serialization / DE: Deterministische Tx-Serialisierung / RU: Детерминированная сериализация транзакции
  const ordered = { from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce }; // EN: Canonical field order / DE: Kanonische Feldreihenfolge / RU: Каноничный порядок полей
  return JSON.stringify(ordered);                       // EN: Stable JSON / DE: Stabiles JSON / RU: Стабильный JSON
}

function serializeHeader(header) {                      // EN: Deterministic block header serialization / DE: Deterministische Header-Serialisierung / RU: Детерминированная сериализация заголовка
  const ordered = {                                     // EN: Build canonical header object / DE: Kanonisches Header-Objekt / RU: Каноничный объект заголовка
    index:        header.index,                         // EN: Block height / DE: Blockhöhe / RU: Высота блока
    previousHash: header.previousHash,                  // EN: Parent hash / DE: Vorgänger-Hash / RU: Хэш предыдущего
    timestamp:    header.timestamp,                     // EN: Creation time (ms) / DE: Erstellzeit (ms) / RU: Время создания (мс)
    txRoot:       header.txRoot,                        // EN: Transactions root / DE: Transaktions-Root / RU: Корень транзакций
    difficulty:   header.difficulty,                    // EN: PoW difficulty / DE: PoW-Schwierigkeit / RU: Сложность PoW
    nonce:        header.nonce                          // EN: Changing counter / DE: Zählwert (Nonce) / RU: Счётчик (nonce)
  };
  return JSON.stringify(ordered);                       // EN: Stable JSON / DE: Stabiles JSON / RU: Стабильный JSON
}

function simpleTxRoot(transactions) {                   // EN: Simple deterministic tx root (not Merkle) / DE: Einfacher deterministischer Tx-Root / RU: Простой детерминированный корень (не Меркле)
  const normalized = transactions.map(tx => JSON.parse(serializeTx(tx))); // EN: Normalize each tx / DE: Jede Tx normalisieren / RU: Нормализуем каждую транзакцию
  const json = JSON.stringify(normalized);              // EN: Canonical list JSON / DE: Kanonische JSON-Liste / RU: Канонический JSON списка
  return sha256Hex(json);                               // EN: Hash as root / DE: Hash als Root / RU: Хэш как корень
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
// transaction.js — Keys, address, tx, sign/verify, mempool // EN: Demo script / DE: Demo-Skript / RU: Учебный скрипт

const crypto = require('crypto');                                      // EN: Node crypto module / DE: Node-Krypto-Modul / RU: Модуль crypto
const { serializeTx, sha256Hex } = require('./utils');                 // EN: Reuse helpers from utils / DE: Helfer aus utils nutzen / RU: Утилиты из utils

// --- Keys & Address ---------------------------------------------------------
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {   // EN: Generate ECDSA keypair / DE: ECDSA-Schlüsselpaar erzeugen / RU: Сгенерировать пару ключей ECDSA
  namedCurve: 'secp256k1',                                             // EN: Bitcoin/Ethereum curve / DE: Bitcoin/Ethereum-Kurve / RU: Кривая Bitcoin/Ethereum
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },                // EN: Public key format / DE: Format öffentl. Schlüssel / RU: Формат публичного ключа
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }                 // EN: Private key format / DE: Format priv. Schlüssel / RU: Формат приватного ключа
});                                                                     // EN: End options / DE: Ende Optionen / RU: Конец опций

function toAddress(publicKeyPem) {                                      // EN: Derive address from pubkey / DE: Adresse aus Pubkey ableiten / RU: Получить адрес из pubkey
  const hash = sha256Hex(publicKeyPem);                                 // EN: SHA-256(pubkey PEM) / DE: SHA-256(pubkey PEM) / RU: SHA-256(public key PEM)
  return '0x' + hash.slice(0, 40);                                      // EN: First 20 bytes (hex) / DE: Erste 20 Bytes (hex) / RU: Первые 20 байт (hex)
}                                                                       // EN: End toAddress / DE: Ende toAddress / RU: Конец toAddress

const address = toAddress(publicKey);                                   // EN: Sender address / DE: Absenderadresse / RU: Адрес отправителя

// --- Build & hash tx --------------------------------------------------------
const tx = {                                                            // EN: Transaction object / DE: Transaktionsobjekt / RU: Объект транзакции
  from:   address,                                                      // EN: Sender / DE: Absender / RU: Отправитель
  to:     '0x96a23e4cd1fdea96c571cadfe6b5318abcee84cc',                 // EN: Recipient / DE: Empfänger / RU: Получатель
  amount: 100,                                                          // EN: Amount / DE: Betrag / RU: Сумма
  nonce:  1                                                             // EN: Anti-replay counter / DE: Zähler gegen Wiederholung / RU: Счётчик против повтора
};                                                                      // EN: End tx / DE: Ende Tx / RU: Конец tx

const txJson = serializeTx(tx);                                         // EN: Canonical JSON for signing / DE: Kanonisches JSON zum Signieren / RU: Каноничный JSON для подписи
const txHash = sha256Hex(txJson);                                       // EN: Transaction hash (fingerprint) / DE: Transaktionshash / RU: Хэш транзакции

// --- Sign & verify ----------------------------------------------------------
function signTx(txJson, privateKeyPem) {                                // EN: Make signature / DE: Signatur erstellen / RU: Создать подпись
  const signer = crypto.createSign('SHA256');                           // EN: Signer with SHA-256 / DE: Signierer mit SHA-256 / RU: Подписант SHA-256
  signer.update(txJson); signer.end();                                  // EN: Feed data / DE: Daten einspeisen / RU: Передать данные
  return signer.sign(privateKeyPem, 'hex');                             // EN: Signature (hex) / DE: Signatur (hex) / RU: Подпись (hex)
}                                                                       // EN: End signTx / DE: Ende signTx / RU: Конец signTx

function verifyTx(txJson, signatureHex, publicKeyPem) {                 // EN: Verify signature / DE: Signatur prüfen / RU: Проверить подпись
  const v = crypto.createVerify('SHA256');                              // EN: Verifier with SHA-256 / DE: Prüfer mit SHA-256 / RU: Проверяющий SHA-256
  v.update(txJson); v.end();                                            // EN: Feed data / DE: Daten einspeisen / RU: Передать данные
  return v.verify(publicKeyPem, signatureHex, 'hex');                   // EN: true if valid / DE: true wenn gültig / RU: true если корректно
}                                                                       // EN: End verifyTx / DE: Ende verifyTx / RU: Конец verifyTx

const signature = signTx(txJson, privateKey);                           // EN: Produce signature over tx / DE: Signatur über Tx erzeugen / RU: Подписать транзакцию

// --- Mempool with minimal checks -------------------------------------------
const mempool = [];                                                     // EN: Pending txs / DE: Ausstehende Txs / RU: Неподтверждённые транзакции

function addToMempool(txObj, sigHex, pubKeyPem) {                       // EN: Validate & add / DE: Validieren & hinzufügen / RU: Проверить и добавить
  const canon = serializeTx(txObj);                                     // EN: Canonical form / DE: Kanonische Form / RU: Каноничный вид
  if (!verifyTx(canon, sigHex, pubKeyPem))                              // EN: Bad signature? / DE: Schlechte Signatur? / RU: Подпись неверна?
    throw new Error('Invalid signature');                               // EN: Reject / DE: Ablehnen / RU: Отклонить
  if (txObj.from !== toAddress(pubKeyPem))                              // EN: Address must match pubkey / DE: Adresse muss zum Pubkey passen / RU: Адрес должен соответствовать pubkey
    throw new Error('From address does not match public key');          // EN: Reject / DE: Ablehnen / RU: Отклонить
  const dup = mempool.some(e => e.tx.from === txObj.from && e.tx.nonce === txObj.nonce); // EN: Duplicate (from,nonce)? / DE: Duplikat (from,nonce)? / RU: Дубликат (from,nonce)?
  if (dup)                                                              // EN: If duplicate / DE: Falls Duplikat / RU: Если дубликат
    throw new Error('Duplicate (from, nonce) in mempool');              // EN: Reject / DE: Ablehnen / RU: Отклонить
  mempool.push({ tx: txObj, signature: sigHex });                       // EN: Accept into mempool / DE: In Mempool aufnehmen / RU: Добавить в mempool
}                                                                       // EN: End addToMempool / DE: Ende addToMempool / RU: Конец addToMempool

// --- Demo output ------------------------------------------------------------
console.log('Address:', address);                                       // EN: Sender address / DE: Absenderadresse / RU: Адрес отправителя
console.log('TX JSON:', txJson);                                        // EN: Canonical tx JSON / DE: Kanonisches Tx-JSON / RU: Каноничный JSON транзакции
console.log('TX Hash:', txHash);                                        // EN: Hash of tx JSON / DE: Hash des Tx-JSON / RU: Хэш JSON транзакции
console.log('Signature valid?', verifyTx(txJson, signature, publicKey)); // EN: Expect true / DE: Erwartet true / RU: Ожидаем true
console.log('Tamper test:',                                             // EN: Re-verify with modified amount / DE: Prüfen mit geändertem Betrag / RU: Проверка с изменённой суммой
  verifyTx(JSON.stringify({ ...tx, amount: 9999, nonce: tx.nonce }),    // EN: Mutated tx / DE: Veränderte Tx / RU: Мутированная tx
  signature, publicKey));                                               // EN: Use old signature → false / DE: Alte Signatur → false / RU: Старая подпись → false
try {                                                                   // EN: Try to add to mempool / DE: In Mempool einfügen versuchen / RU: Пытаемся добавить в mempool
  addToMempool(tx, signature, publicKey);                               // EN: Validate & push / DE: Validieren & push / RU: Проверить и добавить
  console.log('Mempool size:', mempool.length);                         // EN: Should be 1 / DE: Sollte 1 sein / RU: Должно быть 1
} catch (e) {                                                           // EN: On error / DE: Bei Fehler / RU: В случае ошибки
  console.log('Mempool reject:', e.message);                            // EN: Print reason / DE: Grund ausgeben / RU: Вывести причину
}                                                                       // EN: End try-catch / DE: Ende Try-Catch / RU: Конец try-catch


```

```bash
git add transaction.js && git commit -m "feat(tx): signing/verification and minimal mempool"
```

---

## 4) Block with PoW mining (`block.js`)

**Intent:** block header includes `difficulty` & `nonce`; PoW is satisfied when `hash` starts with N zeros.

Create `block.js`:

```js
// block.js — Block with PoW mining via utils      // EN: Block + mining / DE: Block + Mining / RU: Блок + майнинг

const { sha256Hex, serializeHeader, simpleTxRoot } = require('./utils'); // EN: Reuse utils / DE: Utils wiederverwenden / RU: Переиспользуем утилиты

class Block {                                        // EN: Block class / DE: Block-Klasse / RU: Класс блока
  constructor({ index, previousHash, timestamp, transactions, difficulty = 2, nonce = 0 }) { // EN: Init / DE: Init / RU: Инициализация
    this.index        = index;                       // EN: Height / DE: Höhe / RU: Высота
    this.previousHash = previousHash;                // EN: Parent hash / DE: Vorgänger-Hash / RU: Хэш предыдущего
    this.timestamp    = timestamp;                   // EN: Unix ms / DE: Unix ms / RU: Unix мс
    this.transactions = transactions;                // EN: Payload / DE: Nutzlast / RU: Полезная нагрузка
    this.txRoot       = simpleTxRoot(transactions);  // EN: Deterministic tx root / DE: Deterministischer Tx-Root / RU: Детерминированный корень
    this.difficulty   = difficulty;                  // EN: PoW difficulty / DE: PoW-Schwierigkeit / RU: Сложность PoW
    this.nonce        = nonce;                       // EN: Changes while mining / DE: Ändert sich beim Mining / RU: Меняется при майнинге
    this.hash         = this.computeHash();          // EN: Initial header hash / DE: Initialer Header-Hash / RU: Начальный хэш заголовка
  }

  header() {                                         // EN: Build header object / DE: Header-Objekt bauen / RU: Собрать объект заголовка
    return {
      index:        this.index,                      // EN: Height / DE: Höhe / RU: Высота
      previousHash: this.previousHash,               // EN: Link / DE: Verknüpfung / RU: Связь
      timestamp:    this.timestamp,                  // EN: Time / DE: Zeit / RU: Время
      txRoot:       this.txRoot,                     // EN: Tx root / DE: Tx-Root / RU: Корень транзакций
      difficulty:   this.difficulty,                 // EN: Difficulty / DE: Schwierigkeit / RU: Сложность
      nonce:        this.nonce                       // EN: Nonce / DE: Nonce / RU: Нонс
    };
  }

  computeHash() {                                    // EN: SHA-256 over serialized header / DE: SHA-256 über serialisierten Header / RU: SHA-256 по заголовку
    const data = serializeHeader(this.header());     // EN: Deterministic bytes / DE: Deterministische Bytes / RU: Детерминированные байты
    return sha256Hex(data);                          // EN: Hex hash / DE: Hex-Hash / RU: Hex-хэш
  }

  recomputeHash() {                                  // EN: Recompute after nonce changes / DE: Neu berechnen / RU: Пересчёт после изменения nonce
    this.hash = this.computeHash();                  // EN: Update cached hash / DE: Cache-Hash aktualisieren / RU: Обновляем хэш
    return this.hash;                                // EN: Return new hash / DE: Neuen Hash zurückgeben / RU: Возвращаем новый хэш
  }

  meetsDifficulty() {                                // EN: Check leading-zero target / DE: Führende Nullen / RU: Префикс нулей
    const prefix = '0'.repeat(this.difficulty);      // EN: Target prefix / DE: Zielpräfix / RU: Целевой префикс
    return this.hash.startsWith(prefix);             // EN: Satisfied? / DE: Erfüllt? / RU: Выполнено?
  }

  mine(maxIterations = 1e7) {                        // EN: Brute-force nonce / DE: Nonce bruteforcen / RU: Перебор nonce
    const prefix = '0'.repeat(this.difficulty);      // EN: Target / DE: Ziel / RU: Цель
    let it = 0;                                      // EN: Iterations / DE: Iterationen / RU: Итерации
    while (!this.hash.startsWith(prefix)) {          // EN: Loop until target / DE: Schleife bis Ziel / RU: Крутим до цели
      this.nonce++;                                  // EN: Change nonce / DE: Nonce erhöhen / RU: Увеличиваем nonce
      this.recomputeHash();                          // EN: Refresh hash / DE: Hash neu berechnen / RU: Пересчитываем хэш
      if (++it >= maxIterations) throw new Error('PoW: max iterations reached'); // EN/DE/RU: Стоп по лимиту
    }
    return this;                                     // EN: Return mined block / DE: Geminten Block zurückgeben / RU: Вернуть добытый блок
  }
}

module.exports = Block;                              // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса

```

```bash
git add block.js && git commit -m "feat(block): PoW block (difficulty/nonce) and mining"
```

---

## 5) Blockchain container (`blockchain.js`)

**Intent:** maintain a valid chain; create genesis; mine & append blocks; validate PoW and linkage.

Create `blockchain.js`:

```js
// blockchain.js — Simple chain with PoW mining    // EN: Simple PoW chain / DE: Einfache PoW-Chain / RU: Простая цепь с PoW

const Block = require('./block');                    // EN: Use Block class / DE: Block-Klasse nutzen / RU: Используем класс Block

class Blockchain {                                   // EN: Chain container / DE: Ketten-Container / RU: Контейнер цепочки
  constructor({ difficulty = 3 } = {}) {             // EN: Global difficulty / DE: Globale Difficulty / RU: Глобальная сложность
    this.difficulty = difficulty;                    // EN: Store difficulty / DE: Difficulty speichern / RU: Сохраняем сложность
    this.chain      = [this.createGenesisBlock()];   // EN: Start with genesis / DE: Start mit Genesis / RU: Начинаем с генезиса
  }

  createGenesisBlock() {                             // EN: Build genesis block / DE: Genesis-Block erzeugen / RU: Создать генезис-блок
    const b = new Block({
      index:        0,                               // EN: Height 0 / DE: Höhe 0 / RU: Высота 0
      previousHash: '0'.repeat(64),                  // EN: Null prev-hash / DE: Null-Vorhash / RU: Нулевой предыдущий хэш
      timestamp:    Date.now(),                      // EN: Now / DE: Jetzt / RU: Сейчас
      transactions: [],                              // EN: Empty payload / DE: Leere Nutzlast / RU: Пустая нагрузка
      difficulty:   this.difficulty,                 // EN: Same difficulty / DE: Gleiche Difficulty / RU: Та же сложность
      nonce:        0                                // EN: No mining needed / DE: Kein Mining nötig / RU: Майнинг не нужен
    });
    return b;                                        // EN: Return genesis / DE: Genesis zurückgeben / RU: Вернуть генезис
  }

  latest() { return this.chain[this.chain.length - 1]; } // EN: Tail block / DE: Letzter Block / RU: Последний блок

  addBlock(block) {                                  // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
    const tip = this.latest();
    if (block.index        !== tip.index + 1) throw new Error('Bad index');     // EN: Height check / DE: Höhen-Check / RU: Проверка высоты
    if (block.previousHash !== tip.hash)      throw new Error('Bad prevHash');  // EN: Link check / DE: Verknüpfungs-Check / RU: Проверка связи
    if (!block.meetsDifficulty())            throw new Error('Not mined');      // EN: PoW must hold / DE: PoW muss gelten / RU: Должен соблюдаться PoW
    if (block.computeHash() !== block.hash)  throw new Error('Hash mismatch');  // EN: Integrity / DE: Integrität / RU: Целостность
    this.chain.push(block);                         // EN: Append / DE: Anhängen / RU: Добавляем
    return block;                                   // EN: Return appended / DE: Zurückgeben / RU: Вернуть добавленный
  }

  mineBlock(transactions = []) {                    // EN: Build→mine→add / DE: Bauen→minen→hinzufügen / RU: Создать→майнить→добавить
    const block = new Block({
      index:        this.latest().index + 1,        // EN: Next height / DE: Nächste Höhe / RU: Следующая высота
      previousHash: this.latest().hash,             // EN: Link to tip / DE: Verknüpfung zur Spitze / RU: Связь с вершиной
      timestamp:    Date.now(),                     // EN: Now / DE: Jetzt / RU: Сейчас
      transactions,                                 // EN: Payload / DE: Nutzlast / RU: Полезная нагрузка
      difficulty:   this.difficulty,                // EN: Target / DE: Ziel / RU: Цель
      nonce:        0                               // EN: Start nonce / DE: Start-Nonce / RU: Начальный nonce
    });
    block.mine();                                   // EN: PoW loop / DE: PoW-Schleife / RU: Цикл PoW
    return this.addBlock(block);                    // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
  }

  isValid() {                                       // EN: Full chain check / DE: Komplette Kettenprüfung / RU: Полная проверка цепи
    for (let i = 1; i < this.chain.length; i++) {
      const prev = this.chain[i - 1];
      const cur  = this.chain[i];
      if (cur.previousHash !== prev.hash) return false; // EN: Link ok? / DE: Link ok? / RU: Связь ок?
      if (!cur.meetsDifficulty())   return false;       // EN: PoW ok?  / DE: PoW ok?  / RU: PoW ок?
      if (cur.computeHash() !== cur.hash) return false; // EN: Hash ok?  / DE: Hash ok?  / RU: Хэш ок?
    }
return true;                                        // EN: All good / DE: Alles gut / RU: Всё хорошо
  }
}

module.exports = Blockchain;                        // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса

```

```bash
git add blockchain.js && git commit -m "feat(blockchain): genesis, mineBlock(), isValid()"
```

---

## 6) Smoke tests (`test-block.js`, `test-chain.js`)

**Intent:** quick verification without wiring a CLI.

Create `test-block.js`:

```js
const Block = require('./block');         // EN: Import Block class / DE: Block-Klasse importieren / RU: Импорт класса Block

const b = new Block({                     // EN: Create candidate block / DE: Kandidatenblock erzeugen / RU: Создаём блок-кандидат
  index:        1,                        // EN: Block height / DE: Blockhöhe / RU: Высота блока
  previousHash: '00',                     // EN: Placeholder previous hash / DE: Platzhalter-Vorhash / RU: Заглушка предыдущего хэша
  timestamp:    Date.now(),               // EN: Current time (ms) / DE: Aktuelle Zeit (ms) / RU: Текущее время (мс)
  transactions: [],                       // EN: No transactions / DE: Keine Transaktionen / RU: Без транзакций
  difficulty:   3                         // EN: Require hash to start with 000 / DE: Hash muss mit 000 beginnen / RU: Хэш должен начинаться с 000
});                                       // EN: End constructor args / DE: Ende Konstruktorargumente / RU: Конец аргументов конструктора

console.log('⛏ Mining...');               // EN: Log start of mining / DE: Start des Minings loggen / RU: Лог старта майнинга
b.mine();                                  // EN: Run PoW to find nonce / DE: PoW ausführen um Nonce zu finden / RU: Запускаем PoW для поиска nonce

console.log('Hash:', b.hash);              // EN: Print mined hash / DE: Geminten Hash ausgeben / RU: Вывести хэш блока
console.log('Nonce:', b.nonce);            // EN: Print discovered nonce / DE: Gefundene Nonce ausgeben / RU: Вывести найденный nonce


```

Create `test-chain.js`:

```js
const Blockchain = require('./blockchain');            // EN: Import Blockchain class / DE: Blockchain-Klasse importieren / RU: Импорт класса Blockchain

const chain = new Blockchain({ difficulty: 3 });       // EN: Create chain with global difficulty / DE: Kette mit globaler Difficulty / RU: Создаём цепь с общей сложностью
console.log('Genesis hash:', chain.latest().hash);     // EN: Show genesis hash / DE: Genesis-Hash anzeigen / RU: Показать хэш генезиса

const txs = [                                          // EN: Sample transactions array / DE: Beispiel-Transaktionsliste / RU: Массив тестовых транзакций
  { from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 }, // EN: Tx #1 fields / DE: Tx #1 Felder / RU: Поля транзакции №1
  { from: '0xccc', to: '0xddd', amount: 7, nonce: 1 }  // EN: Tx #2 fields / DE: Tx #2 Felder / RU: Поля транзакции №2
];                                                     // EN: End array / DE: Ende Array / RU: Конец массива

console.log('⛏ Mining block #1...');                   // EN: Log start of block #1 mining / DE: Start Mining Block #1 loggen / RU: Лог начала майнинга блока №1
const b1 = chain.mineBlock(txs);                       // EN: Build→mine→append block with txs / DE: Block mit Txs bauen→minen→anhängen / RU: Создать→вымайнить→добавить блок с txs

console.log('Mined hash:', b1.hash);                   // EN: Print block hash / DE: Block-Hash ausgeben / RU: Вывести хэш блока
console.log('Nonce:', b1.nonce);                       // EN: Print block nonce / DE: Nonce des Blocks ausgeben / RU: Вывести nonce блока
console.log('Chain valid?', chain.isValid());          // EN: Validate full chain / DE: Gesamte Kette validieren / RU: Проверить валидность цепи

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
