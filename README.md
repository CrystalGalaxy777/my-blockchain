# My Blockchain Learning (JS)

> **RU:** Мини-проект: ключи → адрес → транзакция → подпись/проверка → mempool.  
> **EN:** Mini project: keys → address → transaction → sign/verify → mempool.  
> **DE:** Mini-Projekt: Schlüssel → Adresse → Transaktion → Signieren/Prüfen → Mempool.

---

## Highlights
- **RU:** Генерация ключей (ECDSA secp256k1), адресов, транзакций, подписей, проверка, мини-mempool  
- **EN:** ECDSA (secp256k1) keypair, address, transaction, signature, verification, mini-mempool  
- **DE:** ECDSA (secp256k1) Schlüssel, Adresse, Transaktion, Signatur, Verifikation, Mini-Mempool  

---

## How to run

```bash
# clone repository
git clone <YOUR_REPO_URL> my-blockchain
cd my-blockchain

# run script
node transaction.js

Address: 0x1234abcd...
TX JSON: {"from":"0x...","to":"0x...","amount":100,"nonce":1}
Valid signature? true
Valid after tamper? false