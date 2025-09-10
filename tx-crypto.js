// tx-crypto.js — pure helpers (no side effects)
// EN: Pure helpers / DE: Reine Helfer / RU: Чистые хелперы без побочек
const crypto = require('crypto'); // EN/DE/RU: Node crypto

function serializeTx(tx) { // EN: deterministic JSON / DE: deterministisches JSON / RU: детермин. JSON
  const ordered = { from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce };
  return JSON.stringify(ordered);
}

function sha256(data) { // EN/DE/RU: SHA-256 helper
  return crypto.createHash('sha256').update(data).digest('hex');
}

function signTx(txJson, privateKeyPem) { // EN/DE/RU: sign
  const s = crypto.createSign('SHA256'); s.update(txJson); s.end();
  return s.sign(privateKeyPem, 'hex');
}

function verifyTx(txJson, signatureHex, publicKeyPem) { // EN/DE/RU: verify
  const v = crypto.createVerify('SHA256'); v.update(txJson); v.end();
  return v.verify(publicKeyPem, signatureHex, 'hex');
}

function toAddress(publicKeyPem) { // EN/DE/RU: short address from pubkey
  const hash = sha256(publicKeyPem);
  return '0x' + hash.slice(0, 40);
}

module.exports = { serializeTx, sha256, signTx, verifyTx, toAddress };
