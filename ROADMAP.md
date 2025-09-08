# ROADMAP – My Blockchain Project  

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

5. **Test Script / Testskript / Тестовый скрипт (`testBlockchain.js`)**  
   - EN: End-to-End: Transaction → Mempool → Block → Blockchain  
   - DE: End-to-End: Transaktion → Mempool → Block → Blockchain  
   - RU: Полный цикл: Транзакция → Мempool → Блок → Блокчейн  
   - EN: Includes manipulation test (tampered TX invalid) & block tampering check (`isValid() = false`)  
   - DE: Enthält Manipulationstest (veränderte TX ungültig) & Block-Manipulation (`isValid() = false`)  
   - RU: Проверка на подделку транзакции и блока (`isValid() = false`)  

6. **README & GitHub**  
   - EN: Documented steps, expected outputs, TODO experiments, `.gitignore` without `node_modules/`  
   - DE: Schritte dokumentiert, erwartete Ausgaben, TODO-Experimente, `.gitignore` ohne `node_modules/`  
   - RU: Документация шагов, ожидаемый вывод, эксперименты по TODO, `.gitignore` без `node_modules/`  

---

## 🚀 Next steps / Nächste Schritte / Следующие шаги  

1. **Proof-of-Work (Mining)**  
   - EN: Implement `mineBlock(difficulty)`, require hash with leading zeros, measure effort  
   - DE: `mineBlock(difficulty)` implementieren, Hash mit führenden Nullen, Aufwand messen  
   - RU: Реализовать `mineBlock(difficulty)`, находить хэш с начальными нулями, измерить сложность  

2. **Blockchain extension / Blockchain erweitern / Расширение блокчейна**  
   - EN: Integrate mining into addBlock, add reward transactions (Coinbase)  
   - DE: Mining in addBlock integrieren, Reward-Transaktionen (Coinbase) hinzufügen  
   - RU: Интегрировать майнинг в addBlock, добавить наградные транзакции (Coinbase)  

3. **P2P Network / P2P-Netzwerk / P2P-сеть**  
   - EN: Simulate multiple nodes, exchange blocks/transactions, resolve conflicts (Longest Chain Rule)  
   - DE: Mehrere Nodes simulieren, Blöcke/Transaktionen austauschen, Konflikte lösen (Longest Chain Rule)  
   - RU: Смоделировать несколько узлов, обмен блоками/транзакциями, разрешение конфликтов (Longest Chain Rule)  

4. **Blockchain Explorer / CLI**  
   - EN: User-friendly console output, later small web frontend  
   - DE: Übersichtliche Konsolenausgabe, später kleines Web-Frontend  
   - RU: Удобный вывод в консоли, позже маленький веб-интерфейс  

5. **Accounts & Smart Contracts (advanced) / Accounts & Smart Contracts (fortgeschritten) / Аккаунты и смарт-контракты (продвинуто)**  
   - EN: Ethereum-like accounts, Solidity basics, first smart contracts  
   - DE: Ethereum-ähnliche Accounts, Solidity-Grundlagen, erste Smart Contracts  
   - RU: Аккаунты по типу Ethereum, основы Solidity, первые смарт-контракты  
