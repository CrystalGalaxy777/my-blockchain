// block.js — Minimal Block with difficulty & utils // EN: Minimal Block / DE: Minimaler Block / RU: Мини-блок

const { sha256Hex, serializeHeader, simpleTxRoot } = require('./utils'); // EN: Reuse helpers / DE: Helfer wiederverwenden / RU: Переиспользуем утилиты

class Block { // EN: Block class / DE: Block-Klasse / RU: Класс блока
  constructor({ index, previousHash, timestamp, transactions, difficulty = 2, nonce = 0 }) { // EN: Init fields / DE: Felder initialisieren / RU: Инициализация полей
    this.index = index; // EN: Height / DE: Höhe / RU: Высота
    this.previousHash = previousHash; // EN: Parent link / DE: Verknüpfung / RU: Связь с предыдущим
    this.timestamp = timestamp; // EN: Unix ms / DE: Unix ms / RU: Unix мс
    this.transactions = transactions; // EN: Payload / DE: Nutzlast / RU: Полезная нагрузка
    this.txRoot = simpleTxRoot(transactions); // EN: Deterministic tx root / DE: Deterministischer Tx-Root / RU: Детерминированный корень транзакций
    this.difficulty = difficulty; // EN: PoW difficulty / DE: PoW-Schwierigkeit / RU: Сложность PoW
    this.nonce = nonce; // EN: Will change during mining / DE: Ändert sich beim Mining / RU: Меняется при майнинге
    this.hash = this.computeHash(); // EN: Initial header hash / DE: Initialer Header-Hash / RU: Начальный хэш заголовка
  }

  header() { // EN: Build header object / DE: Header-Objekt bauen / RU: Собрать объект заголовка
    return { // EN: These fields define the hash / DE: Diese Felder bestimmen den Hash / RU: Эти поля определяют хэш
      index: this.index, // EN: Height / DE: Höhe / RU: Высота
      previousHash: this.previousHash, // EN: Link / DE: Verknüpfung / RU: Связь
      timestamp: this.timestamp, // EN: Time / DE: Zeit / RU: Время
      txRoot: this.txRoot, // EN: Tx root / DE: Tx-Root / RU: Корень транзакций
      difficulty: this.difficulty, // EN: Difficulty / DE: Schwierigkeit / RU: Сложность
      nonce: this.nonce // EN: Nonce / DE: Nonce / RU: Нонс
    }; // EN: End header / DE: Ende Header / RU: Конец заголовка
  }

  computeHash() { // EN: SHA-256 over serialized header / DE: SHA-256 über serialisierten Header / RU: SHA-256 по сериализованному заголовку
    const data = serializeHeader(this.header()); // EN: Deterministic bytes / DE: Deterministische Bytes / RU: Детерминированные байты
    return sha256Hex(data); // EN: Hex hash / DE: Hex-Hash / RU: Hex-хэш
  }

  recalcHash() { // EN: Recompute after nonce changes / DE: Neu berechnen nach Nonce-Änderungen / RU: Пересчёт после изменения nonce
    this.hash = this.computeHash(); // EN: Refresh cached hash / DE: Zwischengespeicherten Hash aktualisieren / RU: Обновить хэш
    return this.hash; // EN: Return new hash / DE: Neuen Hash zurückgeben / RU: Вернуть новый хэш
  }

  meetsDifficulty() { // EN: Check leading zeros target / DE: Führende-Nullen-Ziel prüfen / RU: Проверка префикса нулей
    const prefix = '0'.repeat(this.difficulty); // EN: Target prefix / DE: Zielpräfix / RU: Целевой префикс
    return this.hash.startsWith(prefix); // EN: True if satisfied / DE: True wenn erfüllt / RU: True если условие выполнено
  }
}

module.exports = Block; // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
