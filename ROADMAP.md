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

6. **Integration: mineFromMempool**  
   - EN: New method `mineFromMempool()` drains txs from mempool and mines block.  
   - DE: Neue Methode `mineFromMempool()`, die Txs aus Mempool entnimmt und Block mined.  
   - RU: Добавлен метод `mineFromMempool()`, который забирает транзакции из mempool и майнит блок.  

7. **Tests**  
   - EN: Smoke tests for block, chain, mempool integration, PoW demo.  
   - DE: Smoke-Tests für Block, Chain, Mempool-Integration, PoW-Demo.  
   - RU: Тесты для блока, цепочки, интеграции mempool, демо PoW.  

8. **README & GitHub**  
   - EN: Documented steps, usage examples, `.gitignore` without `node_modules/`  
   - DE: Schritte dokumentiert, Beispiele, `.gitignore` ohne `node_modules/`  
   - RU: Документация шагов, примеры, `.gitignore` без `node_modules/`  
---

## 🚀 Next steps / Nächste Schritte / Следующие шаги  

1. **Miner reward (Coinbase transaction)**  
   - EN: Add reward tx at index 0; configurable `blockReward`.  
   - DE: Reward-Transaktion an Index 0 hinzufügen; konfigurierbarer `blockReward`.  
   - RU: Добавить наградную транзакцию в начале списка; параметр `blockReward`.  

2. **Balances & State validation**  
   - EN: Track balances, reject overspending before mempool insert.  
   - DE: Kontostände einführen; Overspending vor Aufnahme in Mempool ablehnen.  
   - RU: Ввести учёт балансов; отклонять перерасход до добавления в mempool.  

3. **Extended tests**  
   - EN: Assertions for reward, balances, mempool selection (Node assert or Jest).  
   - DE: Tests für Reward, Kontostände, Mempool-Auswahl.  
   - RU: Тесты для награды, балансов, выбора транзакций из mempool.  

4. **P2P Network**  
   - EN: Simulate multiple nodes, exchange blocks/txs, resolve conflicts (Longest Chain Rule).  
   - DE: Mehrere Nodes simulieren, Blöcke/Txs austauschen, Konflikte lösen (Longest Chain Rule).  
   - RU: Смоделировать несколько узлов, обмен блоками/транзакциями, разрешение конфликтов (Longest Chain Rule).  

5. **Blockchain Explorer / CLI**  
   - EN: User-friendly console logs, later small web frontend.  
   - DE: Übersichtliche Konsolenausgabe, später kleines Web-Frontend.  
   - RU: Удобный вывод в консоли, позже маленький веб-интерфейс.  

6. **Accounts & Smart Contracts (advanced)**  
   - EN: Ethereum-like accounts, Solidity basics, first smart contracts.  
   - DE: Ethereum-ähnliche Accounts, Solidity-Grundlagen, erste Smart Contracts.  
   - RU: Аккаунты по типу Ethereum, основы Solidity, первые смарт-контракты.  

---

_Last updated: 2025-09-11_  
