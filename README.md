# My Blockchain Learning (JS)

> **EN:** Mini project: keys → address → transaction → sign/verify → mempool → blocks → blockchain.  
> **DE:** Mini-Projekt: Schlüssel → Adresse → Transaktion → Signieren/Prüfen → Mempool → Blöcke → Blockchain.  
> **RU:** Мини-проект: ключи → адрес → транзакция → подпись/проверка → mempool → блоки → блокчейн.  

---

## Highlights

* **EN:** ECDSA (secp256k1) keypair, address, transaction, signature, verification, mini-mempool, blocks, blockchain integrity check  
* **DE:** ECDSA (secp256k1) Schlüssel, Adresse, Transaktion, Signatur, Verifikation, Mini-Mempool, Blöcke, Blockchain-Integritätsprüfung  
* **RU:** Генерация ключей (ECDSA secp256k1), адресов, транзакций, подписей, проверка, мини-мемпул, блоки, проверка целостности блокчейна

---

## How to run

### 1. Transactions & Mempool

```bash
node transaction.js
```

Output example:

```
Address: 0x1234abcd...
TX JSON: {"from":"0x...","to":"0x...","amount":100,"nonce":1}
Valid signature? true
Valid after tamper? false
Mempool size: 1
```

### 2. Blocks

```bash
node block.js
```

Output example:

```
b0.hash: e3b0c44298fc1c14
b1.prev==b0.hash? true
```

### 3. Blockchain

```bash
node blockchain.js
```

Output example:

```
Chain length: 2
Blockchain valid? true
```

---

## New features (Chapter 4 — Blocks & Blockchain)

* **EN:** Added `Block` class with deterministic header (`index, prevHash, timestamp, txRoot, nonce`) and unique block ID (`hash`).

* **DE:** Neue `Block`-Klasse mit deterministischem Header (`index, prevHash, timestamp, txRoot, nonce`) und eindeutiger Block-ID (`hash`).

* **RU:** Добавлен класс `Block` с детерминированным заголовком (`index, prevHash, timestamp, txRoot, nonce`) и уникальным ID блока (`hash`).

* **EN:** Mini-test in `block.js`: creates Genesis block and Block #1, checks `prevHash` linkage.

* **DE:** Mini-Test in `block.js`: erstellt Genesis-Block und Block #1, prüft die `prevHash`-Verknüpfung.

* **RU:** Мини-тест в `block.js`: создаёт генезис-блок и блок №1, проверяет связь через `prevHash`.

* **EN:** Added `Blockchain` class: manages chain of blocks, validates integrity (`isValid`).

* **DE:** Neue `Blockchain`-Klasse: verwaltet Blockkette, überprüft Integrität (`isValid`).

* **RU:** Добавлен класс `Blockchain`: управляет цепочкой блоков, проверяет целостность (`isValid`).
