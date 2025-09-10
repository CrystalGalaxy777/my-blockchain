// @ts-nocheck
// transaction.js — Lesson 1: Digital signatures for transactions
// EN: Demo of keys → address → tx → sign/verify → mempool (using external modules)
// DE: Demo von Schlüssel → Adresse → Tx → Signieren/Prüfen → Mempool (externe Module)
// RU: Демонстрация ключи → адрес → транзакция → подпись/проверка → мемпул (внешние модули)

const crypto = require('crypto'); // EN: Node crypto / DE: Node-Krypto / RU: Модуль crypto

// ✅ IMPORT PURE HELPERS (no side effects) -----------------------------------
// EN: Import helper functions from a clean, side-effect-free module
// DE: Hilfsfunktionen aus einem sauberen Modul ohne Nebeneffekte importieren
// RU: Импорт «чистых» хелперов без побочных эффектов
const { serializeTx, sha256, signTx, verifyTx, toAddress } = require('./tx-crypto'); 

// ✅ KEYS & ADDRESS -----------------------------------------------------------
// EN: Generate ECDSA secp256k1 keypair and derive a short address from pubkey
// DE: ECDSA-secp256k1 Schlüsselpaar erzeugen und kurze Adresse aus Public Key ableiten
// RU: Генерируем пару ключей ECDSA secp256k1 и получаем короткий адрес из публичного ключа
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
console.log('Private key:\n', privateKey);  // EN/DE/RU: (Demo) do not print keys in real apps
console.log('Public key:\n',  publicKey);

const address = toAddress(publicKey);       // EN: Derive sender address / DE: Absenderadresse ableiten / RU: Получаем адрес отправителя
console.log('Address:', address);

// ✅ BUILD TX (DEMO) ----------------------------------------------------------
// EN: Deterministic fields to keep signatures reproducible
// DE: Deterministische Felder für reproduzierbare Signaturen
// RU: Детерминированные поля для воспроизводимых подписей
const tx = {
  from:   address,                                         // EN/DE/RU: sender
  to:     '0x96a23e4cd1fdea96c571cadfe6b5318abcee84cc',    // EN/DE/RU: recipient (placeholder)
  amount: 100,                                             // EN/DE/RU: amount
  nonce:  1                                                // EN/DE/RU: anti-replay counter
};
console.log('TX (raw):', tx);

// ✅ SERIALIZE & HASH ---------------------------------------------------------
const txJson = serializeTx(tx);                 // EN: Canonical JSON / DE: Kanonisches JSON / RU: Каноничный JSON
const txHash = sha256(txJson);                  // EN/DE/RU: SHA-256 of tx JSON
console.log('TX JSON:', txJson);
console.log('TX Hash:', txHash);

// ✅ SIGN & VERIFY ------------------------------------------------------------
const signature = signTx(txJson, privateKey);   // EN: Sign with private key / DE: Mit privatem Schlüssel signieren / RU: Подписываем приватным ключом
console.log('Signature (hex):', signature.slice(0, 48) + '…');

console.log('Valid signature?', verifyTx(txJson, signature, publicKey));
// EN: expect true / DE: true erwartet / RU: ожидаем true

// ✅ TAMPER TEST --------------------------------------------------------------
const tampered = { ...tx, amount: 9999 };       // EN/DE/RU: simulate data change
const tamperedJson = serializeTx(tampered);
console.log('Valid after tamper?', verifyTx(tamperedJson, signature, publicKey));
// EN: expect false / DE: false erwartet / RU: ожидаем false

// ✅ MEMPOOL (EXTERNAL MODULE) -----------------------------------------------
// EN: Use external mempool with a lightweight validator
// DE: Externen Mempool mit leichtem Validator nutzen
// RU: Используем внешний мемпул с лёгким валидатором
const Mempool = require('./mempool');

function txValidator(txObj, sigHex, pubKeyPem) {     // EN: Basic checks / DE: Basisprüfungen / RU: Базовые проверки
  const json = serializeTx(txObj);
  if (!verifyTx(json, sigHex, pubKeyPem)) return false;   // EN: bad signature / DE: schlechte Signatur / RU: подпись неверна
  const expected = toAddress(pubKeyPem);
  return txObj.from === expected;                         // EN: from must match pubkey / DE: from muss zum PubKey passen / RU: from должен соответствовать pubkey
}

const mempool = new Mempool(txValidator, 1000);      // EN: pool(limit=1000) / DE: Pool / RU: пул

try {
  mempool.add(tx, signature, publicKey);             // EN/DE/RU: add signed tx
  console.log('Mempool size:', mempool.size());      // EN/DE/RU: should be 1
} catch (e) {
  console.log('Mempool reject:', e.message);
}

// ✅ EXPORTS (for tests & other modules) --------------------------------------
// EN: Re-export helpers and the mempool instance to keep public API stable
// DE: Helfer und Mempool-Instanz re-exportieren, um die öffentliche API stabil zu halten
// RU: Ре-экспорт хелперов и экземпляра мемпула, чтобы внешний API не менялся
module.exports = {
  serializeTx,
  sha256,
  signTx,
  verifyTx,
  toAddress,
  mempool
};
