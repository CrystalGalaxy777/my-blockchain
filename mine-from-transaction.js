// mine-from-mempool.js — Demo: mine a block using the shared mempool
// EN: Mine a block by draining txs from the same mempool used in transaction.js
// DE: Einen Block minen, indem wir Txs aus dem selben Mempool wie in transaction.js entnehmen
// RU: Майним блок, забирая транзакции из того же mempool, что и в transaction.js

const Blockchain = require('./blockchain');         // EN/DE/RU: Blockchain class
const { mempool } = require('./transaction');       // EN/DE/RU: Reuse the exported mempool instance

// EN: Lower difficulty to make demo fast
// DE: Geringere Difficulty, damit die Demo schnell läuft
// RU: Уменьшаем сложность, чтобы демо работало быстро
const chain = new Blockchain({ difficulty: 2 });

console.log('⛏ Mining from mempool...');           // EN/DE/RU: Start log
const b1 = chain.mineFromMempool(mempool);          // EN: key call / DE: Kernaufruf / RU: ключевой вызов

console.log('Mined block hash:', b1.hash);          // EN/DE/RU: show mined hash
console.log('Nonce:', b1.nonce);                    // EN/DE/RU: show nonce
console.log('Tx count in block:', b1.transactions.length); // EN/DE/RU: number of txs included
console.log('Chain valid?', chain.isValid());       // EN/DE/RU: full chain validation
