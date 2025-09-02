// utils.js — Shared helpers (crypto & serialization) // EN: Shared helpers / DE: Gemeinsame Helfer / RU: Общие утилиты

const crypto = require('crypto'); // EN: Import Node.js crypto / DE: Node.js-Krypto importieren / RU: Подключаем модуль crypto

function sha256Hex(data) { // EN: SHA-256 wrapper / DE: SHA-256-Hülle / RU: Обёртка для SHA-256
  return crypto.createHash('sha256').update(data).digest('hex'); // EN: Hash to hex / DE: Hash als Hex / RU: Хэш в hex
}

function serializeTx(tx) { // EN: Deterministic tx serialization / DE: Deterministische Tx-Serialisierung / RU: Детерминированная сериализация транзакции
  const ordered = { 
    from: tx.from, 
    to: tx.to, 
    amount: tx.amount, 
    nonce: tx.nonce }; // EN: Canonical field order / DE: Kanonische Feldreihenfolge / RU: Каноничный порядок полей
  return JSON.stringify(ordered); // EN: Stable JSON / DE: Stabiles JSON / RU: Стабильный JSON
}

function serializeHeader(header) { // EN: Deterministic block header serialization / DE: Deterministische Header-Serialisierung / RU: Детерминированная сериализация заголовка
  const ordered = { // EN: Build canonical header object / DE: Kanonisches Header-Objekt / RU: Каноничный объект заголовка
    index: header.index, // EN: Block height / DE: Blockhöhe / RU: Высота блока
    previousHash: header.previousHash, // EN: Parent hash / DE: Vorgänger-Hash / RU: Хэш предыдущего
    timestamp: header.timestamp, // EN: Creation time (ms) / DE: Erstellzeit (ms) / RU: Время создания (мс)
    txRoot: header.txRoot, // EN: Transactions root / DE: Transaktions-Root / RU: Корень транзакций
    difficulty: header.difficulty, // EN: PoW difficulty / DE: PoW-Schwierigkeit / RU: Сложность PoW
    nonce: header.nonce // EN: Changing counter / DE: Zählwert (Nonce) / RU: Счётчик (nonce)
  }; // EN: End canonical header / DE: Ende kanonischer Header / RU: Конец каноничного заголовка
  return JSON.stringify(ordered); // EN: Stable JSON / DE: Stabiles JSON / RU: Стабильный JSON
}

function simpleTxRoot(transactions) { // EN: Simple deterministic tx root (not Merkle) / DE: Einfacher deterministischer Tx-Root / RU: Простой детерминированный корень (не Меркле)
  const normalized = transactions.map(tx => JSON.parse(serializeTx(tx))); // EN: Normalize each tx / DE: Jede Tx normalisieren / RU: Нормализуем каждую транзакцию
  const json = JSON.stringify(normalized); // EN: Canonical list JSON / DE: Kanonische JSON-Liste / RU: Канонический JSON списка
  return sha256Hex(json); // EN: Hash as root / DE: Hash als Root / RU: Хэш как корень
}

module.exports = { sha256Hex, serializeTx, serializeHeader, simpleTxRoot }; // EN: Export helpers / DE: Helfer exportieren / RU: Экспорт утилит
