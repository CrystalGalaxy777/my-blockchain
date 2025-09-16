// test-coinbase.js — Smoke test for miner reward (coinbase) // EN: Coinbase smoke / DE: Coinbase Smoke / RU: Смоук-тест coinbase
const assert = require('assert');                                                     // EN: Assert / DE: Assert / RU: Assert
const Blockchain = require('./blockchain');                                          // EN: Chain / DE: Kette / RU: Цепь
const Mempool = require('./mempool');                                                // EN: Mempool / DE: Mempool / RU: Мемпул

const miner = '0xminer1';                                                             // EN: Demo miner / DE: Demo-Miner / RU: Майнер для демо
const reward = 50;                                                                    // EN: Demo reward / DE: Demo-Reward / RU: Награда в демо
const chain = new Blockchain({ difficulty: 2, blockReward: reward });                 // EN: Easy PoW + reward / DE: Leichter PoW + Reward / RU: Упрощённый PoW + награда

// Coinbase-only block (никаких пользовательских tx)                                   // EN/DE/RU
const mempool = new Mempool((tx) => chain.validateTxAgainstState(tx), 1000);          // EN: Validator (won't be used) / DE: Validator / RU: Валидатор
const block = chain.mineFromMempool(mempool, Infinity, { minerAddress: miner });      // EN: Mine with coinbase / DE: Mit Coinbase minen / RU: Майнить с coinbase

console.log('Mined hash:', block.hash);                                               // EN/DE/RU
console.log('Nonce:', block.nonce);                                                   // EN/DE/RU
console.log('Tx count:', block.transactions.length);                                  // EN/DE/RU

const cb = block.transactions[0];                                                     // EN: First tx is coinbase / DE: Erste Tx ist Coinbase / RU: Первая tx — coinbase
assert.strictEqual(cb.from, null, 'coinbase.from must be null');                      // EN/DE/RU
assert.strictEqual(cb.to, miner, 'coinbase.to must equal miner address');             // EN/DE/RU
assert.strictEqual(cb.amount, reward, 'coinbase.amount must equal reward');           // EN/DE/RU
assert.strictEqual(cb.nonce, block.index, 'coinbase.nonce must equal block height');  // EN/DE/RU

assert.ok(chain.isValid(), 'chain must be valid after mining');                       // EN/DE/RU
console.log('✅ coinbase smoke test passed');                                          // EN/DE/RU
