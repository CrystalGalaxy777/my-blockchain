// mine-from-transaction.js
// EN: Mine a block using the SAME mempool instance from transaction.js
// DE: Einen Block minen mit DEMSELBEN Mempool aus transaction.js
// RU: Майнить блок, используя ТОТ ЖЕ mempool из transaction.js

const Blockchain = require('./blockchain');         // EN/DE/RU: Chain
const { mempool } = require('./transaction');       // EN/DE/RU: SAME mempool instance
                                                    // (Запуск transaction.js при require — это нормально для демо)

console.log('Mempool size before mining:', mempool.size());

const chain = new Blockchain({ difficulty: 2 });    // EN/DE/RU: keep mining fast for demo
console.log('⛏ Mining from mempool...');
const block = chain.mineFromMempool(mempool);       // EN/DE/RU: pulls txs via takeAll()

console.log('Mined hash:', block.hash);
console.log('Nonce:', block.nonce);
console.log('Tx count in block:', block.transactions.length);
console.log('Mempool size after mining:', mempool.size());
console.log('Chain valid?', chain.isValid());
