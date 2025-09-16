// test-state-apply.js — balances update via blocks // EN: Balances apply / DE: Salden anwenden / RU: Обновление балансов
const assert = require('assert');                                           // EN: Node assert / DE: Node-Assert / RU: Встроенный assert
const Blockchain = require('./blockchain');                                 // EN: Import chain / DE: Kette importieren / RU: Импорт цепи
const Mempool = require('./mempool');                                       // EN: Import mempool / DE: Mempool importieren / RU: Импорт мемпула

const miner = '0xminer';                                                    // EN: Miner address / DE: Miner-Adresse / RU: Адрес майнера
const alice = '0xalice';                                                    // EN: Alice address / DE: Alice-Adresse / RU: Адрес Алисы
const chain = new Blockchain({ difficulty: 2, blockReward: 50 });           // EN: Easy PoW+reward / DE: Leichter PoW+Reward / RU: Упрощённый PoW+награда

// 1) Mine first block with only coinbase                                   // EN: Credit miner / DE: Miner gutschreiben / RU: Начислить майнеру
const mem1 = new Mempool((tx) => chain.validateTxAgainstState(tx), 1000);   // EN: Empty mempool / DE: Leerer Mempool / RU: Пустой мемпул
const b1 = chain.mineFromMempool(mem1, Infinity, { minerAddress: miner });  // EN: Mine coinbase / DE: Coinbase minen / RU: Майнить coinbase
assert.strictEqual(chain.getBalance(miner), 50, 'miner should get 50');     // EN: Check miner 50 / DE: Miner 50 prüfen / RU: Майнер 50

// 2) Create user tx: miner -> alice (12) with nonce=1                      // EN: Spend from miner / DE: Vom Miner ausgeben / RU: Тратить майнером
const mem2 = new Mempool((tx) => chain.validateTxAgainstState(tx), 1000);   // EN: New mempool / DE: Neuer Mempool / RU: Новый мемпул
mem2.add({ from: miner, to: alice, amount: 12, nonce: 1 });                 // EN: Valid tx / DE: Gültige Tx / RU: Валидная tx

// 3) Mine second block: coinbase(50 to miner) + tx(miner->alice 12)        // EN: Mine + apply / DE: Minen + anwenden / RU: Майнить + применить
const b2 = chain.mineFromMempool(mem2, Infinity, { minerAddress: miner });  // EN: Mine block / DE: Block minen / RU: Майнить блок

// After b2: miner gets +50 (coinbase) -12 (tx) = 88; alice +12             // EN: New balances / DE: Neue Salden / RU: Новые балансы
assert.strictEqual(chain.getBalance(miner), 88, 'miner should be 88');      // EN: 88 check / DE: 88 prüfen / RU: 88 проверить
assert.strictEqual(chain.getBalance(alice), 12, 'alice should be 12');      // EN: 12 check / DE: 12 prüfen / RU: 12 проверить

console.log('✅ balances updated correctly (miner=88, alice=12)');          // EN: Success / DE: Erfolg / RU: Успех
