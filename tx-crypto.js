// tx-crypto.js — pure helpers (no side effects) // EN: Pure helpers / DE: Reine Helfer / RU: Чистые хелперы
const crypto = require('crypto'); // EN: Node crypto / DE: Node-Krypto / RU: Модуль crypto

function serializeTx(tx) { // EN: Deterministic JSON / DE: Deterministisches JSON / RU: Детерм. JSON
  const ordered = { from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce }; // EN: Canonical fields / DE: Kanonische Felder / RU: Каноничные поля
  return JSON.stringify(ordered); // EN: Stable string / DE: Stabile Zeichenkette / RU: Стабильная строка
}

function sha256(data) { // EN: SHA-256 helper / DE: SHA-256-Helfer / RU: Хелпер SHA-256
  return crypto.createHash('sha256').update(data).digest('hex'); // EN: Digest hex / DE: Hex-Digest / RU: Хэш hex
}

function signTx(txJson, privateKeyPem) { // EN: Sign JSON / DE: JSON signieren / RU: Подписать JSON
  const s = crypto.createSign('SHA256'); s.update(txJson); s.end(); // EN: Build signer / DE: Signierer bauen / RU: Создаём подписант
  return s.sign(privateKeyPem, 'hex'); // EN: Return hex signature / DE: Hex-Signatur zurück / RU: Возврат hex-подписи
}

function verifyTx(txJson, signatureHex, publicKeyPem) { // EN: Verify signature / DE: Signatur prüfen / RU: Проверка подписи
  const v = crypto.createVerify('SHA256'); v.update(txJson); v.end(); // EN: Build verifier / DE: Prüfer bauen / RU: Создаём проверяющий
  return v.verify(publicKeyPem, signatureHex, 'hex'); // EN: true if valid / DE: true wenn gültig / RU: true если корректно
}

function toAddress(publicKeyPem) { // EN: Short address from pubkey / DE: Kurze Adresse aus Pubkey / RU: Короткий адрес из pubkey
  const hash = sha256(publicKeyPem); // EN: Hash PEM / DE: PEM hashen / RU: Хэш PEM
  return '0x' + hash.slice(0, 40); // EN: First 20 bytes / DE: Erste 20 Bytes / RU: Первые 20 байт
}

module.exports = { serializeTx, sha256, signTx, verifyTx, toAddress }; // EN: Export API / DE: API exportieren / RU: Экспорт API
