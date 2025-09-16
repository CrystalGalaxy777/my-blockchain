// test-mine-mempool.js — mine a block using funded mempool txs // EN: Mine from mempool with funding / DE: Aus Mempool mit Funding minen / RU: Майним из мемпула после пополнения
const Blockchain = require('./blockchain');                         // EN: Import chain / DE: Kette importieren / RU: Импорт блокчейна
const Mempool    = require('./mempool');                            // EN: Import mempool / DE: Mempool importieren / RU: Импорт мемпула

const miner = '0xminer1';                                           // EN: Demo miner / DE: Demo-Miner / RU: Демо-майнер
const a = '0xaaa', b = '0xbbb', c = '0xccc', d = '0xddd';           // EN: Demo addresses / DE: Demo-Adressen / RU: Демо-адреса

const mempool = new Mempool(null, 1000);                            // EN: No validator (demo) / DE: Kein Validator (Demo) / RU: Без валидатора (демо)

const chain = new Blockchain({ difficulty: 2, blockReward: 50 });   // EN: Easier PoW + reward / DE: Einfacher PoW + Reward / RU: Упрощённый PoW + награда

console.log('Mempool size before funding:', mempool.size());        // EN/DE/RU: Размер мемпула до пополнения

console.log('⛏ Block #1: coinbase to miner...');                    // EN: Only coinbase / DE: Nur Coinbase / RU: Только coinbase
chain.mineBlock([], { minerAddress: miner });                        // EN: Reward to miner / DE: Reward an Miner / RU: Награда майнеру

console.log('⛏ Block #2: fund senders from miner (nonces=1,2)...'); // EN: Fund a&c / DE: a&c finanzieren / RU: Пополняем a и c
chain.mineBlock([                                                   // EN: Two funding txs / DE: Zwei Funding-Txs / RU: Две funding-тx
  { from: miner, to: a, amount: 10, nonce: 1 },                     // EN: Miner→a (nonce=1) / DE: Miner→a / RU: Майнер→a
  { from: miner, to: c, amount: 12, nonce: 2 }                      // EN: Miner→c (nonce=2) / DE: Miner→c / RU: Майнер→c
], { minerAddress: miner });                                         // EN: Include coinbase / DE: Coinbase einfügen / RU: Включаем coinbase

mempool.add({ from: a, to: b, amount: 5, nonce: 1 });               // EN: a pays b / DE: a zahlt b / RU: a платит b
mempool.add({ from: c, to: d, amount: 7, nonce: 1 });               // EN: c pays d / DE: c zahlt d / RU: c платит d

console.log('Mempool size before mining:', mempool.size());         // EN/DE/RU: Размер мемпула перед майнингом
console.log('⛏ Mining from mempool...');                            // EN/DE/RU: Майним из мемпула

const block = chain.mineFromMempool(mempool, Infinity, {            // EN: Pull all txs / DE: Alle Txs ziehen / RU: Забираем все tx
  minerAddress: miner                                               // EN: Required for coinbase / DE: Pflicht für Coinbase / RU: Обязательно для coinbase
});

console.log('Mined hash:', block.hash);                             // EN/DE/RU: Хэш блока
console.log('Nonce:', block.nonce);                                 // EN/DE/RU: Нонс
console.log('Tx count in block:', block.transactions.length);       // EN/DE/RU: Кол-во tx в блоке
console.log('Mempool size after mining:', mempool.size());          // EN/DE/RU: Размер мемпула после
console.log('Chain valid?', chain.isValid());                       // EN/DE/RU: Цепь валидна?
