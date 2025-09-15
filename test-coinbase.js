// test-coinbase.js — Smoke test for miner reward (coinbase) // EN: Smoke test for coinbase / DE: Smoke-Test für Coinbase / RU: Смоук-тест для coinbase

'use strict';                                                                                 // EN: Strict mode / DE: Strikter Modus / RU: Строгий режим
const assert = require('assert');                                                              // EN: Node assert / DE: Node-Assert / RU: Встроенный assert
const Blockchain = require('./blockchain');                                                    // EN: Import Blockchain / DE: Blockchain importieren / RU: Импорт Blockchain
const Mempool = require('./mempool');                                                          // EN: Import Mempool / DE: Mempool importieren / RU: Импорт Mempool

const miner = '0xminer1';                                                                      // EN: Demo miner address / DE: Demo-Miner-Adresse / RU: Адрес майнера для демо
const reward = 50;                                                                             // EN: Demo reward amount / DE: Demo-Reward-Betrag / RU: Размер награды в демо

const mempool = new Mempool(null, 1000);                                                       // EN: Create mempool without validator / DE: Mempool ohne Validator / RU: Мемпул без валидатора
mempool.add({ from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 });                              // EN: Add user tx #1 / DE: Nutzer-Tx #1 hinzufügen / RU: Добавляем пользовательскую tx №1

const chain = new Blockchain({ difficulty: 2 });                                               // EN: Easier PoW for speed / DE: Leichtere PoW für Geschwindigkeit / RU: Упрощённый PoW для скорости
const block = chain.mineFromMempool(mempool, Infinity, { minerAddress: miner, reward });       // EN: Mine from mempool with coinbase / DE: Aus Mempool mit Coinbase minen / RU: Майним из мемпула с coinbase

console.log('Mined hash:', block.hash);                                                        // EN: Print block hash / DE: Block-Hash ausgeben / RU: Печать хэша блока
console.log('Nonce:', block.nonce);                                                            // EN: Print nonce / DE: Nonce ausgeben / RU: Печать nonce
console.log('Tx count:', block.transactions.length);                                           // EN: Print tx count / DE: Anzahl Txs ausgeben / RU: Печать числа транзакций

const cb = block.transactions[0];                                                              // EN: First tx is coinbase / DE: Erste Tx ist Coinbase / RU: Первая tx — coinbase
assert.strictEqual(cb.from, null, 'coinbase.from must be null');                               // EN: from must be null / DE: from muss null sein / RU: from должен быть null
assert.strictEqual(cb.to, miner, 'coinbase.to must equal miner address');                      // EN: to must be miner / DE: to muss Miner sein / RU: to должен быть адрес майнера
assert.strictEqual(cb.amount, reward, 'coinbase.amount must equal reward');                    // EN: amount must equal reward / DE: amount muss Reward sein / RU: amount равен награде
assert.strictEqual(cb.nonce, block.index, 'coinbase.nonce must equal block height');           // EN: nonce equals height / DE: Nonce entspricht Höhe / RU: nonce равен высоте блока

const userTx = block.transactions[1];                                                          // EN: Second tx is the user tx / DE: Zweite Tx ist Nutzer-Tx / RU: Вторая tx — пользовательская
assert.ok(userTx, 'user tx should be present');                                                // EN: Must exist / DE: Muss existieren / RU: Должна существовать
assert.strictEqual(userTx.from, '0xaaa', 'user tx.from mismatch');                             // EN: Check from / DE: from prüfen / RU: Проверка from
assert.strictEqual(userTx.to, '0xbbb', 'user tx.to mismatch');                                 // EN: Check to / DE: to prüfen / RU: Проверка to
assert.strictEqual(userTx.amount, 5, 'user tx.amount mismatch');                               // EN: Check amount / DE: Betrag prüfen / RU: Проверка суммы
assert.strictEqual(userTx.nonce, 1, 'user tx.nonce mismatch');                                 // EN: Check nonce / DE: Nonce prüfen / RU: Проверка nonce

assert.ok(chain.isValid(), 'chain must be valid after mining');                                // EN: Chain must remain valid / DE: Kette muss gültig sein / RU: Цепь должна быть валидной
assert.strictEqual(mempool.size(), 0, 'mempool should be empty after mining');                 // EN: Mempool drained / DE: Mempool geleert / RU: Мемпул опустошён

console.log('✅ coinbase smoke test passed');                                                  // EN: Success message / DE: Erfolgsnachricht / RU: Успешное завершение
