// test-mine-mempool.js
// EN: Demo: mine a block using transactions pulled from the mempool
// DE: Demo: Einen Block minen mit Transaktionen aus dem Mempool
// RU: Демо: майним блок, забирая транзакции из мемпула

const Blockchain = require('./blockchain'); // EN/DE/RU: Import chain
const Mempool    = require('./mempool');    // EN/DE/RU: Import mempool class

// EN: For the demo we don't validate signatures → pass no validator (null).
// DE: Für das Demo keine Signaturprüfung → kein Validator (null).
// RU: Для демо без проверки подписи → валидатор не передаём (null).
const mempool = new Mempool(null, 1000);

// EN/DE/RU: Add a couple of fake txs (unique (from, nonce) to avoid duplicates)
mempool.add({ from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 });
mempool.add({ from: '0xccc', to: '0xddd', amount: 7, nonce: 1 });

console.log('Mempool size before mining:', mempool.size());

// EN/DE/RU: Create chain and mine from mempool
const chain = new Blockchain({ difficulty: 2 });
console.log('⛏ Mining from mempool...');
const block = chain.mineFromMempool(mempool); // <-- uses your new method

console.log('Mined hash:', block.hash);
console.log('Nonce:', block.nonce);
console.log('Tx count in block:', block.transactions.length);
console.log('Mempool size after mining:', mempool.size());
console.log('Chain valid?', chain.isValid());
