// test-overspend.js — reject overspending in mempool // EN: Reject overspend / DE: Overspend ablehnen / RU: Отклонить перерасход
const assert = require('assert');                                // EN: Node assert / DE: Node-Assert / RU: Встроенный assert
const Blockchain = require('./blockchain');                      // EN: Import chain / DE: Kette importieren / RU: Импорт цепи
const Mempool = require('./mempool');                            // EN: Import mempool / DE: Mempool importieren / RU: Импорт мемпула

const chain = new Blockchain({ difficulty: 2, blockReward: 50 }); // EN: Easy PoW+reward / DE: Leichter PoW+Reward / RU: Упрощённый PoW+награда
const mempool = new Mempool((tx) => chain.validateTxAgainstState(tx), 1000); // EN: Validator uses state / DE: Validator nutzt State / RU: Валидатор на state

const alice = '0xalice';                                         // EN: Sender (no funds) / DE: Sender (keine Mittel) / RU: Отправитель (0 средств)
const bob   = '0xbob';                                           // EN: Recipient / DE: Empfänger / RU: Получатель

// Try to add tx with no balance (overspend)                     // EN: Expect rejection / DE: Ablehnung erwarten / RU: Ожидаем отказ
let errorMsg = null;                                             // EN: Capture error / DE: Fehler erfassen / RU: Сохраняем ошибку
try {
  mempool.add({ from: alice, to: bob, amount: 10, nonce: 1 });   // EN: Overspend tx / DE: Overspend-Tx / RU: Перерасход-тx
} catch (e) {
  errorMsg = e.message;                                          // EN: Save message / DE: Nachricht speichern / RU: Сообщение
}

assert.ok(errorMsg, 'overspend should be rejected');             // EN: Must fail / DE: Muss fehlschlagen / RU: Должно упасть
console.log('✅ overspend rejected as expected');                // EN: Success / DE: Erfolg / RU: Успех
