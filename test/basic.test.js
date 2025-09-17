// test/basic.test.js — sanity checks (utils vs tx-crypto) // EN: Sanity checks / DE: Grundchecks / RU: Базовые проверки

const assert = require('assert');                                      // EN: Node assert / DE: Node-Assert / RU: Встроенный assert
const crypto = require('crypto');                                      // EN: Node crypto / DE: Node-Krypto / RU: Модуль crypto
const { serializeTx, sha256Hex } = require('../utils');                // EN: Utils: serializer + hex-hash / DE: Utils / RU: Утилиты
const { sha256 } = require('../tx-crypto');                            // EN: Tx-layer hash alias / DE: Tx-Hash-Alias / RU: Хэш на слое транзакций

// --- serializeTx: determinism ----------------------------------------------
const tx = { from: 'a', to: 'b', amount: 10, nonce: 1 };               // EN: Base tx / DE: Basistransaktion / RU: Базовая транзакция
const ser = serializeTx(tx);                                           // EN: Canonical JSON / DE: Kanonisches JSON / RU: Каноничный JSON
assert.strictEqual(                                                    // EN: Must match literal / DE: Muss wortgleich sein / RU: Должен совпасть
  ser,
  JSON.stringify({ from: 'a', to: 'b', amount: 10, nonce: 1 }),        // EN: Expected stable order / DE: Feste Reihenfolge / RU: Фиксированный порядок
  'serializeTx() must be deterministic'                                // EN/DE/RU: Сообщение об ошибке
);

const txWithExtra = { ...tx, foo: 123, bar: 'x' };                     // EN: Extra fields / DE: Extra-Felder / RU: Лишние поля
assert.strictEqual(serializeTx(txWithExtra), ser,                      // EN: Extras ignored / DE: Extras ignorieren / RU: Игнор лишних полей
  'serializeTx() must ignore extra fields');                           // EN/DE/RU: Сообщение об ошибке

// --- sha256Hex (utils) vs Node crypto --------------------------------------
const nodeHash = crypto.createHash('sha256').update('test').digest('hex'); // EN: Reference hash / DE: Referenzhash / RU: Эталонный хэш
const utilHash = sha256Hex('test');                                   // EN: Our utils hash / DE: Utils-Hash / RU: Хэш через utils
assert.strictEqual(utilHash, nodeHash,                                 // EN: Must be identical / DE: Muss identisch sein / RU: Должен совпасть
  'sha256Hex() must match Node crypto output');                        // EN/DE/RU: Сообщение об ошибке
assert.strictEqual(utilHash.length, 64,                                // EN: 32 bytes → 64 hex chars / DE: 32 Byte → 64 Hex-Zeichen / RU: 32 байта → 64 hex-символа
  'sha256Hex() must return 64 hex chars');                             // EN/DE/RU: Сообщение об ошибке

// --- sha256 (tx-crypto) must equal sha256Hex (utils) -----------------------
const txHashViaUtils = sha256Hex(ser);                                 // EN: Hash via utils / DE: Hash über Utils / RU: Хэш через utils
const txHashViaTxCrypto = sha256(ser);                                 // EN: Hash via tx-crypto / DE: Hash über tx-crypto / RU: Хэш через tx-crypto
assert.strictEqual(                                                    // EN: Should match exactly / DE: Muss exakt gleich sein / RU: Должны совпасть
  txHashViaTxCrypto, txHashViaUtils,
  'tx-crypto.sha256() must equal utils.sha256Hex()'                    // EN/DE/RU: Сообщение об ошибке
);

// --- done -------------------------------------------------------------------
console.log('✅ All basic tests passed');                               // EN: Success / DE: Erfolg / RU: Успех
