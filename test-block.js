const Block = require('./block'); // EN: Import Block class / DE: Block-Klasse importieren / RU: Импортируем класс Block

// создаём блок-кандидат
const b = new Block({
  index: 1,               // EN: Block height = 1 / DE: Blockhöhe = 1 / RU: Высота блока = 1
  previousHash: '00',     // EN: Fake prev hash / DE: Platzhalter für vorherigen Hash / RU: Заглушка для хэша предыдущего блока
  timestamp: Date.now(),  // EN: Current time / DE: Aktuelle Zeit / RU: Текущее время
  transactions: [],       // EN: No txs for test / DE: Keine Transaktionen / RU: Транзакций нет
  difficulty: 3           // EN: Require hash to start with 000 / DE: Hash muss mit 000 beginnen / RU: Хэш должен начинаться с 000
});

console.log('⛏ Mining...'); // EN/DE/RU: Сообщение о старте майнинга
b.mine();                   // EN: Run PoW / DE: Proof-of-Work starten / RU: Запускаем Proof-of-Work

console.log('Hash:', b.hash);   // EN: Show mined hash / DE: Geminten Hash anzeigen / RU: Показать хэш добытого блока
console.log('Nonce:', b.nonce); // EN: Show nonce / DE: Nonce anzeigen / RU: Показать nonce
