// block.js — Chapter 4 / Minimal Block (JS)  // [RU/EN/DE] Мини-блок с детермин. заголовком и хэшем / Minimal block with deterministic header & hash / Minimaler Block mit deterministischem Header & Hash
// Purpose:                                   // [RU/EN/DE] Цель: показать структуру блока и связь prevHash→hash / Purpose: show block structure and prevHash→hash linkage / Zweck: Blockstruktur und prevHash→hash-Verknüpfung zeigen
// Outcome:                                   // [RU/EN/DE] Результат: умеем делать hash=SHA256(serializeHeader), готово к сборке цепочки / Outcome: compute hash=SHA256(serializeHeader), ready for chain / Ergebnis: Hash=SHA256(serializeHeader), bereit für Kette

const crypto = require('crypto');                                                    // [RU/EN/DE] Импорт crypto из Node / Import Node crypto / Node-Krypto importieren

function sha256Hex(str) {                                                            // [RU/EN/DE] SHA-256 строки → hex / SHA-256 of string → hex / SHA-256 der Zeichenkette → Hex
  return crypto.createHash('sha256').update(str).digest('hex');                      // [RU/EN/DE] Вычислить SHA-256 / Compute SHA-256 / SHA-256 berechnen
}                                                                                    //.createHash('sha256')   // создаём «пустой» объект-хэшировщик
                                                                                     //.update(str)            // кормим его строкой (данными)
                                                                                     //.digest('hex');         // просим вернуть результат в hex-строке

function serializeHeader(h) {                                                        // [RU/EN/DE] Детерм. сериализация заголовка / Deterministic header serialization / Deterministische Header-Serialisierung
  const ordered = {                                                                  // [RU/EN/DE] Фиксированный порядок полей / Fixed field order / Feste Feldreihenfolge
    index: h.index,                                                                  // [RU/EN/DE] Номер блока / Block height / Blockhöhe
    prevHash: h.prevHash,                                                            // [RU/EN/DE] Хэш прошлого блока / Previous hash / Vorheriger Hash
    timestamp: h.timestamp,                                                          // [RU/EN/DE] Метка времени (мс) / Timestamp (ms) / Zeitstempel (ms)
    txRoot: h.txRoot,                                                                // [RU/EN/DE] Корень транзакций / Tx root / Tx-Wurzel
    nonce: h.nonce,                                                                  // [RU/EN/DE] Nonce (для будущего PoW) / Nonce (future PoW) / Nonce (künftiges PoW)
  };                                                                                 // [RU/EN/DE] Объект заголовка / Header object / Header-Objekt
  return JSON.stringify(ordered);                                                    // [RU/EN/DE] В JSON-строку / To JSON string / Zu JSON-String
}

function simpleTxRoot(txs) {                                                         // [RU/EN/DE] Упрощённый txRoot / Simplified tx root / Vereinfachter Tx-Root
  return sha256Hex(JSON.stringify(txs));                                             // [RU/EN/DE] Хэш массива tx / Hash tx array / Tx-Array hashen
}

class Block {                                                                        // [RU/EN/DE] Класс блока / Block class / Block-Klasse
  constructor(index, prevHash, txs) {                                                // [RU/EN/DE] Индекс, prevHash, транзакции / Index, prevHash, txs / Index, prevHash, Txs
    this.txs = Array.isArray(txs) ? txs : [];                                        // [RU/EN/DE] Тело блока (tx[]) / Block body (tx[]) / Blockkörper (Tx[])
    this.header = {                                                                  // [RU/EN/DE] Заголовок блока / Block header / Block-Header
      index,                                                                         // [RU/EN/DE] Высота / Height / Höhe
      prevHash,                                                                      // [RU/EN/DE] Ссылка назад / Back link / Rückverweis
      timestamp: Date.now(),                                                         // [RU/EN/DE] Время создания / Creation time / Erstellzeit
      txRoot: simpleTxRoot(this.txs),                                                // [RU/EN/DE] Корень от tx / Root of tx / Wurzel der Tx
      nonce: 0,                                                                      // [RU/EN/DE] Nonce по умолчанию / Default nonce / Standard-Nonce
    };                                                                               // [RU/EN/DE] Конец заголовка / End header / Header Ende
    this.hash = sha256Hex(serializeHeader(this.header));                             // [RU/EN/DE] Хэш заголовка (ID блока) / Header hash (block ID) / Header-Hash (Block-ID)
  }                                                                                  // [RU/EN/DE] Конец конструктора / End constructor / Ende Konstruktor
}                                                                                    // [RU/EN/DE] Конец класса / End of class / Ende der Klasse

module.exports = { Block, sha256Hex, serializeHeader, simpleTxRoot };                // [RU/EN/DE] Экспорт API / Export API / API exportieren

// --- Опциональный мини-тест при прямом запуске (можно пропустить) ---
if (require.main === module) {                                                       // [RU/EN/DE] Если запущен напрямую / If run directly / Wenn direkt ausgeführt
  const genesisPrev = '0'.repeat(64);                                                // [RU/EN/DE] prevHash генезиса / Genesis prevHash / Genesis-prevHash
  const b0 = new Block(0, genesisPrev, []);                                          // [RU/EN/DE] Генезис-блок / Genesis block / Genesis-Block
  const b1 = new Block(1, b0.hash, [{ from:'0xaaa', to:'0xbbb', amount:10, nonce:1 }]); // [RU/EN/DE] Следующий блок / Next block / Nächster Block
  console.log('b0.hash:', b0.hash.slice(0,16));                                      // [RU/EN/DE] Короткий хэш b0 / Short hash b0 / Kurzer Hash b0
  console.log('b1.prev==b0.hash?', b1.header.prevHash === b0.hash);                  // [RU/EN/DE] Связь блоков / Blocks linked / Blöcke verknüpft
}
