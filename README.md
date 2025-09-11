
# My Blockchain Learning (JS)

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)](https://nodejs.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)  
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()  
[![Stars](https://img.shields.io/github/stars/CrystalGalaxy777/my-blockchain?style=social)](https://github.com/CrystalGalaxy777/my-blockchain/stargazers)  
[![Last Commit](https://img.shields.io/github/last-commit/CrystalGalaxy777/my-blockchain)](https://github.com/CrystalGalaxy777/my-blockchain/commits/main)  
[![Repo Size](https://img.shields.io/github/repo-size/CrystalGalaxy777/my-blockchain)](https://github.com/CrystalGalaxy777/my-blockchain)  



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
````

Output example:

```text
Address: 0x1234abcd...
TX JSON: {"from":"0x...","to":"0x...","amount":100,"nonce":1}
Valid signature? true
Valid after tamper? false
Mempool size: 1
```

### 2. Blocks

```bash
node test-block.js
```

Output example:

```text
⛏ Mining...
Hash: 000e8d9...
Nonce: 2381

```

### 3. Blockchain (linked blocks)

```bash
node test-chain.js
```

Output example:

```text
Genesis hash: 0a1b2c...
⛏ Mining block #1...
Mined hash: 0007ff9...
Nonce: 1293
Chain valid? true
```
### 3.5. Mine from Mempool (integration demo)

```bash
node test-mine-mempool.js
```

Output example:

```text
Mempool size before mining: 2
⛏ Mining from mempool...
Mined hash: 00e...
Nonce: 587
Tx count in block: 2
Mempool size after mining: 0
Chain valid? true
```

Or reuse the same mempool from transaction.js:

```bash
node mine-from-transaction.js
```

### 4. Proof-of-Work Demo

```bash
node pow-demo.js --difficulty 3 -t
```

Output example:

```text
⛏ Mining…
✅ Mined!
Hash:      000a9c0f...
Nonce:     75291
Attempts:  75291
Time:      0.58 s
Rate≈      129,811/s
Timestamp: 1693681234567  (stable=true)
```

---

## Options (Flags)

> **EN:** Available CLI flags for `pow-demo.js`  
> **DE:** Verfügbare CLI-Flags für `pow-demo.js`  
> **RU:** Доступные CLI-флаги для `pow-demo.js`  

| Flag                | Short | Default | Description (EN)                                    | Beschreibung (DE)                                            | Описание (RU)                                                        |
| ------------------- | ----- | ------- | --------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `--difficulty <n>`  | –     | `3`     | Mining difficulty (number of leading zeros in hash) | Mining-Schwierigkeit (Anzahl führender Nullen im Hash)       | Сложность майнинга (кол-во нулей в начале хэша)                      |
| `--maxIter <n>`     | –     | `1e7`   | Maximum attempts before abort                       | Maximale Versuche vor Abbruch                                | Максимальное число попыток перед остановкой                          |
| `--logEvery <n>`    | –     | `50000` | Log progress every N attempts                       | Fortschritt alle N Versuche loggen                           | Выводить прогресс каждые N попыток                                   |
| `--timestampStable` | `-t`  | `false` | Use fixed timestamp for reproducible results        | Statischen Zeitstempel für reproduzierbare Ergebnisse nutzen | Использовать фиксированный timestamp для воспроизводимых результатов |
| `--noSpinner`       | –     | `false` | Disable spinner animation in console                | Spinner-Animation in Konsole deaktivieren                    | Отключить анимацию «спиннера» в консоли                              |

---

### Example

```bash
node pow-demo.js --difficulty 4 --logEvery 10000 -t
```

> **EN:** Mines with difficulty 4, logs progress every 10k attempts, uses stable timestamp.  
> **DE:** Minen mit Schwierigkeit 4, Fortschritt alle 10k Versuche, stabiler Zeitstempel.  
> **RU:** Майнинг со сложностью 4, прогресс каждые 10k попыток, фиксированный timestamp.  

---

## New features (Chapter 4 — Blocks & Blockchain)

* **EN:** Added `Block` class with deterministic header (`index, prevHash, timestamp, txRoot, nonce`) and unique block ID (`hash`). New Blockchain classes with PoW mining and chain validation.

* **DE:** Neue `Block`-Klasse mit deterministischem Header (`index, prevHash, timestamp, txRoot, nonce`) und eindeutiger Block-ID (`hash`).Neue Blockchain-Klassen mit PoW-Mining und Kettenvalidierung.

* **RU:** Добавлен класс `Block` с детерминированным заголовком (`index, prevHash, timestamp, txRoot, nonce`) и уникальным ID блока (`hash`). Добавлен класс Blockchain с PoW-майнингом и проверкой целостности цепи.

* **EN:** Mini-test in `block.js`: creates Genesis block and Block #1, checks `prevHash` linkage.

* **DE:** Mini-Test in `block.js`: erstellt Genesis-Block und Block #1, prüft die `prevHash`-Verknüpfung.

* **RU:** Мини-тест в `block.js`: создаёт генезис-блок и блок №1, проверяет связь через `prevHash`.

* **EN:** Added `Blockchain` class: manages chain of blocks, validates integrity (`isValid`).

* **DE:** Neue `Blockchain`-Klasse: verwaltet Blockkette, überprüft Integrität (`isValid`).

* **RU:** Добавлен класс `Blockchain`: управляет цепочкой блоков, проверяет целостность (`isValid`).

* **EN:** Integrated mempool into mining (mineFromMempool).

* **DE:** Mempool ins Mining integriert (mineFromMempool).

* **RU:** Интегрирован mempool в майнинг (mineFromMempool).

---
## License / Lizenz / Лицензия

- **EN:** This project is licensed under the MIT License — see [LICENSE](./LICENSE).  
- **DE:** Dieses Projekt ist unter der MIT-Lizenz veröffentlicht — siehe [LICENSE](./LICENSE).  
- **RU:** Этот проект распространяется по лицензии MIT — см. [LICENSE](./LICENSE).  

👉 For a formatted multi-language explanation, see [LICENSE.md](./LICENSE.md).


