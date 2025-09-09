
# My Blockchain Learning (JS)

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)](https://nodejs.org/)

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
node block.js
```

Output example:

```text
b0.hash: e3b0c44298fc1c14
b1.prev==b0.hash? true
```

### 3. Blockchain

```bash
node blockchain.js
```

Output example:

```text
Chain length: 2
Blockchain valid? true
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

* **EN:** Added `Block` class with deterministic header (`index, prevHash, timestamp, txRoot, nonce`) and unique block ID (`hash`).

* **DE:** Neue `Block`-Klasse mit deterministischem Header (`index, prevHash, timestamp, txRoot, nonce`) und eindeutiger Block-ID (`hash`).

* **RU:** Добавлен класс `Block` с детерминированным заголовком (`index, prevHash, timestamp, txRoot, nonce`) и уникальным ID блока (`hash`).

* **EN:** Mini-test in `block.js`: creates Genesis block and Block #1, checks `prevHash` linkage.

* **DE:** Mini-Test in `block.js`: erstellt Genesis-Block und Block #1, prüft die `prevHash`-Verknüpfung.

* **RU:** Мини-тест в `block.js`: создаёт генезис-блок и блок №1, проверяет связь через `prevHash`.

* **EN:** Added `Blockchain` class: manages chain of blocks, validates integrity (`isValid`).

* **DE:** Neue `Blockchain`-Klasse: verwaltet Blockkette, überprüft Integrität (`isValid`).

* **RU:** Добавлен класс `Blockchain`: управляет цепочкой блоков, проверяет целостность (`isValid`).

---
## License / Lizenz / Лицензия

- **EN:** This project is licensed under the MIT License — see [LICENSE](./LICENSE).  
- **DE:** Dieses Projekt ist unter der MIT-Lizenz veröffentlicht — siehe [LICENSE](./LICENSE).  
- **RU:** Этот проект распространяется по лицензии MIT — см. [LICENSE](./LICENSE).  

👉 For a formatted multi-language explanation, see [LICENSE.md](./LICENSE.md).


