// block.js — Block with PoW mining via utils // EN: Block + mining / DE: Block + Mining / RU: Блок + майнинг.

const { sha256Hex, serializeHeader, simpleTxRoot } = require('./utils'); // EN: Reuse utils / DE: Utils wiederverwenden / RU: Переиспользуем утилиты

class Block {                         // EN: Block class / DE: Block-Klasse / RU: Класс блока
  constructor({ index, previousHash, timestamp, transactions, difficulty = 2, nonce = 0 }) { // EN: Init fields / DE: Felder initialisieren / RU: Инициализация полей
    this.index = index;               // EN: Height / DE: Höhe / RU: Высота
    this.previousHash = previousHash; // EN: Parent hash / DE: Vorgänger-Hash / RU: Хэш предыдущего
    this.timestamp = timestamp;       // EN: Unix ms / DE: Unix ms / RU: Unix мс
    this.transactions = transactions; // EN: Payload / DE: Nutzlast / RU: Полезная нагрузка
    this.txRoot = simpleTxRoot(transactions); // EN: Deterministic tx root / DE: Deterministischer Tx-Root / RU: Детерминированный корень
    this.difficulty = difficulty;     // EN: PoW difficulty / DE: PoW-Schwierigkeit / RU: Сложность PoW
    this.nonce = nonce;               // EN: Will change while mining / DE: Ändert sich beim Mining / RU: Меняется при майнинге
    this.hash = this.computeHash();   // EN: Initial header hash / DE: Initialer Header-Hash / RU: Начальный хэш заголовка
  }

  header() {                           // EN: Build header object / DE: Header-Objekt bauen / RU: Собрать объект заголовка
    return { 
      index: this.index,               // EN: Height / DE: Höhe / RU: Высота
      previousHash: this.previousHash, // EN: Link / DE: Verknüpfung / RU: Связь
      timestamp: this.timestamp,       // EN: Time / DE: Zeit / RU: Время
      txRoot: this.txRoot,             // EN: Tx root / DE: Tx-Root / RU: Корень транзакций
      difficulty: this.difficulty,     // EN: Difficulty / DE: Schwierigkeit / RU: Сложность
      nonce: this.nonce                // EN: Nonce / DE: Nonce / RU: Нонс
    }; 
  }

  computeHash() {                               // EN: SHA-256 over serialized header / DE: SHA-256 über serialisierten Header / RU: SHA-256 по сериализованному заголовку
    const data = serializeHeader(this.header()); // EN: Deterministic bytes / DE: Deterministische Bytes / RU: Детерминированные байты
    return sha256Hex(data);                     // EN: Hex hash / DE: Hex-Hash / RU: Hex-хэш
  }

  recomputeHash() {                             // EN: Recompute after nonce changes / DE: Neu berechnen nach Nonce-Änderungen / RU: Пересчёт после изменения nonce
    this.hash = this.computeHash();             // EN: Update cached hash / DE: Cache-Hash aktualisieren / RU: Обновляем хэш
    return this.hash;                           // EN: Return new hash / DE: Neuen Hash zurückgeben / RU: Возвращаем новый хэш
  }

  meetsDifficulty() {                           // EN: Check leading-zero target / DE: Führende Nullen prüfen / RU: Проверка префикса нулей
    const prefix = '0'.repeat(this.difficulty); // EN: Target prefix / DE: Zielpräfix / RU: Целевой префикс
    return this.hash.startsWith(prefix);        // EN: True if satisfied / DE: True wenn erfüllt / RU: True если выполнено
  }

  mine(maxIterations = 1e7) {                   // EN: Brute-force nonce / DE: Nonce bruteforcen / RU: Перебор nonce
    const prefix = '0'.repeat(this.difficulty); // EN: Target / DE: Ziel / RU: Цель
    let it = 0;                                 // EN: Iteration counter / DE: Iterationszähler / RU: Счётчик итераций
    while (!this.hash.startsWith(prefix)) {     // EN: Loop until target / DE: Schleife bis Ziel / RU: Крутим до цели
      this.nonce++;                             // EN: Change nonce / DE: Nonce erhöhen / RU: Увеличиваем nonce
      this.recomputeHash();                     // EN: Refresh hash / DE: Hash neu berechnen / RU: Пересчитываем хэш
      if (++it >= maxIterations) throw new Error('PoW: max iterations reached'); // EN: Safety stop / DE: Sicherheitsabbruch / RU: Стоп по лимиту
    }
    return this;                                // EN: Return mined block / DE: Geminten Block zurückgeben / RU: Вернуть добытый блок
  }
}

module.exports = Block;                         // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
