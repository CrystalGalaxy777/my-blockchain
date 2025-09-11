// test-mine-mempool.js — mine using mempool                        // EN: Mine from mempool / DE: Aus Mempool minen / RU: Майним из мемпула
const Blockchain = require('./blockchain');                         // EN: Chain / DE: Kette / RU: Цепь
const Mempool = require('./mempool');                               // EN: Mempool / DE: Mempool / RU: Мемпул

const mempool = new Mempool(null, 1000);                            // EN: No validator for demo / DE: Kein Validator / RU: Без валидатора
mempool.add({ from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 });   // EN: Tx1 / DE: Tx1 / RU: Тх1
mempool.add({ from: '0xccc', to: '0xddd', amount: 7, nonce: 1 });   // EN: Tx2 / DE: Tx2 / RU: Тх2
console.log('Mempool size before mining:', mempool.size());         // EN: Before / DE: Vorher / RU: До

const chain = new Blockchain({ difficulty: 2 });                    // EN: Easier diff / DE: Leichtere Diff / RU: Меньше сложность
console.log('⛏ Mining from mempool...');                           // EN: Start / DE: Start / RU: Старт
const block = chain.mineFromMempool(mempool);                       // EN: Use new method / DE: Neue Methode / RU: Новый метод

console.log('Mined hash:', block.hash); console.log('Nonce:', block.nonce); // EN: Result / DE: Ergebnis / RU: Результат
console.log('Tx count in block:', block.transactions.length);       // EN: Count / DE: Anzahl / RU: Количество
console.log('Mempool size after mining:', mempool.size());          // EN: After / DE: Nachher / RU: После
console.log('Chain valid?', chain.isValid());                       // EN: Validate / DE: Validieren / RU: Проверка
