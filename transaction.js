// transaction.js — Lesson 1: Digital signatures for transactions // EN: Keys→tx→sign/verify→mempool / DE: Schlüssel→Tx→Sign/Prüf→Mempool / RU: Ключи→tx→подпись/проверка→мемпул
const crypto = require('crypto'); // EN: Node crypto / DE: Node-Krypto / RU: Модуль crypto
const { serializeTx, sha256, signTx, verifyTx, toAddress } = require('./tx-crypto'); // EN: Pure helpers / DE: Reine Helfer / RU: Чистые хелперы
const Mempool = require('./mempool'); // EN: Mempool class / DE: Mempool-Klasse / RU: Класс Mempool

const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { // EN: ECDSA keypair / DE: ECDSA-Schlüsselpaar / RU: Пара ключей ECDSA
  namedCurve: 'secp256k1', // EN: BTC/ETH curve / DE: BTC/ETH-Kurve / RU: Кривая BTC/ETH
  publicKeyEncoding: { type: 'spki', format: 'pem' }, // EN: Pub PEM / DE: Pub PEM / RU: Публ. PEM
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' } // EN: Priv PEM / DE: Priv PEM / RU: Приватный PEM
});

const address = toAddress(publicKey); // EN: Short sender address / DE: Kurze Absenderadresse / RU: Короткий адрес отправителя
const tx = { from: address, to: '0x96a23e4cd1fdea96c571cadfe6b5318abcee84cc', amount: 100, nonce: 1 }; // EN: Demo tx / DE: Demo-Tx / RU: Демо-тx
const txJson = serializeTx(tx); const txHash = sha256(txJson); // EN: Canonical JSON + hash / DE: Kanonisches JSON + Hash / RU: Каноничный JSON + хэш
const signature = signTx(txJson, privateKey); // EN: Sign / DE: Signieren / RU: Подписать

function txValidator(txObj, sigHex, pubKeyPem) { // EN: Lightweight validator / DE: Leichter Validator / RU: Лёгкий валидатор
  const json = serializeTx(txObj); // EN: Deterministic JSON / DE: Determ. JSON / RU: Детерм. JSON
  if (!verifyTx(json, sigHex, pubKeyPem)) return false; // EN: Check signature / DE: Signatur prüfen / RU: Проверка подписи
  const expected = toAddress(pubKeyPem); return txObj.from === expected; // EN: from must match / DE: from muss passen / RU: from должен совпадать
}

const mempool = new Mempool(txValidator, 1000); // EN: Pool(limit=1000) / DE: Pool / RU: Пул
try { mempool.add(tx, signature, publicKey); } catch (e) { console.log('Mempool reject:', e.message); } // EN: Insert / DE: Einfügen / RU: Добавить

console.log('Private key:\n', privateKey); // EN: Demo print (unsafe IRL) / DE: Demo-Ausgabe / RU: Демо (в реальном мире нельзя)
console.log('Public key:\n', publicKey); // EN: Demo / DE: Demo / RU: Демо
console.log('Address:', address); // EN: Show address / DE: Adresse anzeigen / RU: Показать адрес
console.log('TX (raw):', tx); // EN: Raw tx / DE: Roh-Tx / RU: Сырая tx
console.log('TX JSON:', txJson); console.log('TX Hash:', txHash); // EN: JSON+hash / DE: JSON+Hash / RU: JSON+хэш
console.log('Signature (hex):', signature.slice(0, 48) + '…'); // EN: First chars / DE: Erste Zeichen / RU: Начало подписи
console.log('Valid signature?', verifyTx(txJson, signature, publicKey)); // EN: Expect true / DE: true erwartet / RU: ожидаем true
const tampered = { ...tx, amount: 9999 }; const tamperedJson = serializeTx(tampered); // EN: Mutate / DE: Ändern / RU: Изменить
console.log('Valid after tamper?', verifyTx(tamperedJson, signature, publicKey)); // EN: Expect false / DE: false erwartet / RU: ожидаем false
console.log('Mempool size:', mempool.size()); // EN: Should be 1 / DE: Sollte 1 sein / RU: Должно быть 1

module.exports = { serializeTx, sha256, signTx, verifyTx, toAddress, mempool }; // EN: Export API / DE: API exportieren / RU: Экспорт API
