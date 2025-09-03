const Blockchain = require('./blockchain');             // EN: Import Blockchain class / DE: Blockchain-Klasse importieren / RU: Импортируем класс Blockchain

// создаём цепочку с глобальной сложностью 3
const chain = new Blockchain({ difficulty: 3 });        // EN/DE/RU: Difficulty = 3 → хэш должен начинаться с 000
console.log('Genesis hash:', chain.latest().hash);      // EN/DE/RU: Показываем хэш генезис-блока

// создаём примерные транзакции
const txs = [
  { from: '0xaaa', to: '0xbbb', amount: 5, nonce: 1 },  // EN: Dummy tx1 / DE: Beispiel-Transaktion / RU: Тестовая транзакция
  { from: '0xccc', to: '0xddd', amount: 7, nonce: 1 }   // EN/DE/RU: Вторая тестовая транзакция
];

console.log('⛏ Mining block #1...');                   // EN/DE/RU: Начинаем майнить блок №1
const b1 = chain.mineBlock(txs);                        // EN: Mine block with txs / DE: Block mit Transaktionen minen / RU: Майним блок с транзакциями

console.log('Mined hash:', b1.hash);                    // EN: Показываем хэш нового блока / DE: Hash des neuen Blocks anzeigen / RU: Хэш нового блока
console.log('Nonce:', b1.nonce);                        // EN/DE/RU: Показываем nonce
console.log('Chain valid?', chain.isValid());           // EN: Validate chain / DE: Kette validieren / RU: Проверяем цепочку
