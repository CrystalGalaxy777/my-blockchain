# ROADMAP – My Blockchain Project  

> **EN:** Learning roadmap from basic cryptography to blockchain & smart contracts.  
> **DE:** Lernfahrplan von Kryptographie-Grundlagen bis Blockchain & Smart Contracts.  
> **RU:** Учебная дорожная карта от криптографии до блокчейна и смарт-контрактов.  

---

## ✅ Completed so far / Bisher umgesetzt / Уже реализовано  

1. **Transactions / Transaktionen / Транзакции**  
   - EN: Generate key pairs (ECDSA secp256k1), derive addresses, sign & verify transactions  
   - DE: Schlüsselpaare (ECDSA secp256k1) erzeugen, Adressen ableiten, Transaktionen signieren & prüfen  
   - RU: Генерация ключевых пар (ECDSA secp256k1), вычисление адресов, подпись и проверка транзакций  

2. **Mempool**  
   - EN: Validate signature, check address, prevent duplicates `(from, nonce)`  
   - DE: Signatur validieren, Adresse prüfen, Duplikate `(from, nonce)` verhindern  
   - RU: Проверка подписи, соответствия адреса и исключение дубликатов `(from, nonce)`  

3. **Block**  
   - EN: Block structure with `index`, `prevHash`, `timestamp`, `txRoot`, `nonce`, `hash`  
   - DE: Blockstruktur mit `index`, `prevHash`, `timestamp`, `txRoot`, `nonce`, `hash`  
   - RU: Структура блока: `index`, `prevHash`, `timestamp`, `txRoot`, `nonce`, `hash`  

4. **Blockchain**  
   - EN: Genesis block, addBlock() with chaining, isValid() for chain validation  
   - DE: Genesis-Block, addBlock() mit Verkettung, isValid() zur Kettenprüfung  
   - RU: Генезис-блок, addBlock() с цепочкой, isValid() для проверки целостности  

5. **Proof-of-Work (Mining)**  
   - EN: Implemented mining with `difficulty` and `nonce`, block hash must start with N zeros  
   - DE: Mining mit `difficulty` und `nonce`, Block-Hash muss mit N Nullen beginnen  
   - RU: Реализован майнинг с `difficulty` и `nonce`, хэш блока должен начинаться с N нулей  

6. **Test Script / Testskript / Тестовый скрипт (`testBlockchain.js`)**  
   - EN: End-to-End: Transaction → Mempool → Block → Blockchain  
   - DE: End-to-End: Transaktion → Mempool → Block → Blockchain  
   - RU: Полный цикл: Транзакция → Мempool → Блок → Блокчейн  
   - Includes manipulation test & block tampering check (`isValid() = false`)  

7. **README & GitHub**  
   - EN: Documented steps, expected outputs, `.gitignore` without `node_modules/`  
   - DE: Schritte dokumentiert, erwartete Ausgaben, `.gitignore` ohne `node_modules/`  
   - RU: Документация шагов, ожидаемый вывод, `.gitignore` без `node_modules/`  

---

## 🚀 Next steps / Nächste Schritte / Следующие шаги  

1. **Integrate mempool → mining**  
   - EN: Mine blocks with real pending transactions (`mempool.takeAll()` + size limit).  
   - Acceptance: `mineBlock()` includes mempool txs in the block.  

2. **Miner reward (Coinbase transaction)**  
   - EN: Add reward tx at index 0; configurable `blockReward`.  
   - Acceptance: Each mined block includes reward transaction.  

3. **Balances & State validation**  
   - EN: Track balances, reject overspending before mempool insert.  
   - Acceptance: Invalid tx (overspend) → rejected.  

4. **Extended tests**  
   - EN: Assertions for mempool selection, reward, balances (Node assert or Jest).  

5. **P2P Network**  
   - EN: Simulate multiple nodes, exchange blocks/txs, resolve conflicts (Longest Chain Rule).  

6. **Blockchain Explorer / CLI**  
   - EN: User-friendly console logs, later small web frontend.  

7. **Accounts & Smart Contracts (advanced)**  
   - EN: Ethereum-like accounts, Solidity basics, first smart contracts.  

---

_Last updated: 2025-09-09_  
