// blockchain.js — Simple chain with PoW mining
// EN: Simple PoW chain / DE: Einfache PoW-Chain / RU: Простая цепь с PoW

const Block = require('./block');         // EN: Use Block class / DE: Block-Klasse nutzen / RU: Используем класс Block

class Blockchain {                        // EN: Chain container / DE: Ketten-Container / RU: Контейнер цепочки
  constructor({ difficulty = 3 } = {}) {  // EN: Global difficulty / DE: Globale Difficulty / RU: Глобальная сложность
    this.difficulty = difficulty;         // EN: Store difficulty / DE: Difficulty speichern / RU: Сохраняем сложность
    this.chain = [this.createGenesisBlock()]; // EN: Start with genesis / DE: Start mit Genesis / RU: Начинаем с генезиса
  }

  createGenesisBlock() {                  // EN: Build genesis block / DE: Genesis-Block erzeugen / RU: Создать генезис-блок
    const b = new Block({
      index: 0,                           // EN: Height 0 / DE: Höhe 0 / RU: Высота 0
      previousHash: '0'.repeat(64),       // EN: Null prev-hash / DE: Null-Vorhash / RU: Нулевой предыдущий хэш
      timestamp: Date.now(),              // EN: Now / DE: Jetzt / RU: Сейчас
      transactions: [],                   // EN: Empty payload / DE: Leere Nutzlast / RU: Пустая нагрузка
      difficulty: this.difficulty,        // EN: Same difficulty / DE: Gleiche Difficulty / RU: Та же сложность
      nonce: 0                            // EN: No mining needed / DE: Kein Mining nötig / RU: Майнинг не нужен
    });
    return b;                             // EN: Return genesis / DE: Genesis zurückgeben / RU: Вернуть генезис
  }

  latest() {                               // EN: Tail block / DE: Letzter Block / RU: Последний блок
    return this.chain[this.chain.length - 1];
  }

  addBlock(block) {                         // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
    const tip = this.latest();
    if (block.index !== tip.index + 1) throw new Error('Bad index');        // EN: Height check / DE: Höhen-Check / RU: Проверка высоты
    if (block.previousHash !== tip.hash) throw new Error('Bad prevHash');   // EN: Link check / DE: Verknüpfungs-Check / RU: Проверка связи
    if (!block.meetsDifficulty()) throw new Error('Not mined');             // EN: PoW must hold / DE: PoW muss gelten / RU: Должен соблюдаться PoW
    if (block.computeHash() !== block.hash) throw new Error('Hash mismatch'); // EN: Integrity / DE: Integrität / RU: Целостность
    this.chain.push(block);                                                  // EN: Append / DE: Anhängen / RU: Добавляем
    return block;                                                            // EN: Return appended / DE: Zurückgeben / RU: Вернуть добавленный
  }

  // ---------- Coinbase helper ----------                                    // EN: DE: RU: Эта транзакция всегда первая в массиве transactions.                              
createCoinbaseTx(minerAddress, reward, height) {                              // EN: Build miner reward tx / DE: Miner-Reward-Tx bauen / RU: Создать tx награды майнеру
  return {                                                                    // EN: Minimal fields for our serializer / DE: Minimale Felder für unseren Serializer / RU: Минимальные поля для сериализации
    from: null,                                                               // EN: DE: RU: coinbase не подписывается и не тратит существующий баланс.                                                              
    to: minerAddress, 
    amount: reward, 
    nonce: height };            
}


mineBlock(transactions = [], opts = {}) {                                        // EN: Extended signature with opts / DE: Erweiterte Signatur mit opts / RU: Расширенная сигнатура с opts
  const { minerAddress, reward = 50 } = opts;                                    // EN: Require miner address + default reward / DE: Miner-Adresse nötig + Standard-Reward / RU: Нужен адрес майнера + награда по умолчанию
  if (!minerAddress) throw new Error('minerAddress is required for coinbase');   // EN: Guard: address must be provided / DE: Absicherung: Adresse erforderlich / RU: Проверка: адрес обязателен
  const height = this.latest().index + 1;                                        // EN: Next block height / DE: Nächste Blockhöhe / RU: Следующая высота
  const coinbase = this.createCoinbaseTx(minerAddress, reward, height);          // EN: Create coinbase tx / DE: Coinbase-Tx erstellen / RU: Создать coinbase-транзакцию
  const txs = [coinbase, ...transactions];                                       // EN: Prepend coinbase / DE: Coinbase voranstellen / RU: Вставить coinbase первой
  const block = new Block({ index: height, previousHash: this.latest().hash, timestamp: Date.now(), transactions: txs, difficulty: this.difficulty, nonce: 0 }); // EN: Build candidate / DE: Kandidaten bauen / RU: Собрать кандидат
  block.mine();                                                                   // EN: Run PoW / DE: PoW ausführen / RU: Запуск PoW
  return this.addBlock(block);                                                    // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
}


  // ---------- Mine using mempool ----------
  // EN: Pull txs from an external mempool and mine a block
  // DE: Txs aus externem Mempool holen und Block minen
  // RU: Забираем транзакции из внешнего мемпула и майним блок
mineFromMempool(mempool, maxTx = Infinity, opts = {}) {                           // EN: Accept miner opts / DE: Miner-Optionen erlauben / RU: Принимаем опции майнера
  if (!mempool || typeof mempool.takeAll !== 'function') {                        // EN/DE/RU: guard
    throw new Error('mineFromMempool: mempool with takeAll() is required');
  }
  const txs = mempool.takeAll(maxTx);                                             // EN: Drain up to N / DE: Bis N entnehmen / RU: Забрать до N
  return this.mineBlock(txs, opts);                                               // EN: Reuse mining with coinbase / DE: Mining mit Coinbase wiederverwenden / RU: Используем майнинг с coinbase
}


  isValid() {                             // EN: Full chain check / DE: Komplette Kettenprüfung / RU: Полная проверка цепи
    for (let i = 1; i < this.chain.length; i++) {
      const prev = this.chain[i - 1];
      const cur  = this.chain[i];
      if (cur.previousHash !== prev.hash) return false; // EN: Link ok? / DE: Link ok? / RU: Связь ок?
      if (!cur.meetsDifficulty())        return false;  // EN: PoW ok?  / DE: PoW ok?  / RU: PoW ок?
      if (cur.computeHash() !== cur.hash) return false; // EN: Hash ok?  / DE: Hash ok?  / RU: Хэш ок?
    }
    return true;                          // EN: All good / DE: Alles gut / RU: Всё хорошо
  }
}

module.exports = Blockchain; // EN: Export / DE: Export / RU: Экспорт
