// blockchain.js — Simple chain with PoW mining
// EN: Simple PoW chain / DE: Einfache PoW-Chain / RU: Простая цепь с PoW

const Block = require('./block');         // EN: Use Block class / DE: Block-Klasse nutzen / RU: Используем класс Block

class Blockchain {                        // EN: Chain container / DE: Ketten-Container / RU: Контейнер цепочки
  constructor({ difficulty = 3, blockReward = 50, halvingInterval = null } = {}) { // EN: Params: PoW diff + reward + optional halving / DE: Parameter: PoW-Diff + Reward + optionales Halving / RU: Параметры: сложность + награда + опциональное халвинг
    this.difficulty = difficulty;                    // EN: Store difficulty / DE: Difficulty speichern / RU: Сохраняем сложность
    this.blockReward = blockReward;                  // EN: Protocol reward per block / DE: Protokoll-Reward pro Block / RU: Протокольная награда за блок
    this.halvingInterval = halvingInterval;          // EN: Halving interval in blocks or null / DE: Halving-Intervall in Blöcken oder null / RU: Интервал халвинга в блоках или null
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

getCurrentReward(height) {                                // EN: Protocol reward at a given height / DE: Protokoll-Reward je Höhe / RU: Награда на данной высоте
  if (!this.halvingInterval || height === 0) return this.blockReward; // EN: No halving or genesis / DE: Kein Halving oder Genesis / RU: Без халвинга или генезис
  const eras = Math.floor(height / this.halvingInterval); // EN: How many eras passed / DE: Wieviele Epochen / RU: Сколько эпох прошло
  return this.blockReward / Math.pow(2, eras);            // EN: Half each era / DE: Je Epoche halbiert / RU: Делим на 2 в каждой эпохе
}


  // ---------- Coinbase helper ----------                                    // EN: DE: RU: Эта транзакция всегда первая в массиве transactions.                              
createCoinbaseTx(minerAddress, reward, height) {                              // EN: Build miner reward tx / DE: Miner-Reward-Tx bauen / RU: Создать tx награды майнеру
  return {                                                                    // EN: Minimal fields for our serializer / DE: Minimale Felder für unseren Serializer / RU: Минимальные поля для сериализации
    from: null,                                                               // EN: DE: RU: coinbase не подписывается и не тратит существующий баланс.                                                              
    to: minerAddress, 
    amount: reward, 
    nonce: height };            
}


mineBlock(transactions = [], opts = {}) {            // EN: Build→coinbase→mine→add / DE: Bauen→Coinbase→minen→anhängen / RU: Собрать→coinbase→майнить→добавить
    const { minerAddress } = opts;                   // EN: Miner address is required / DE: Miner-Adresse erforderlich / RU: Нужен адрес майнера
    if (!minerAddress) throw new Error('minerAddress is required for coinbase'); // EN: Guard / DE: Absicherung / RU: Проверка
    const height = this.latest().index + 1;          // EN: Next height / DE: Nächste Höhe / RU: Следующая высота
    const reward = this.getCurrentReward(height);    // EN: Reward from protocol / DE: Reward aus Protokoll / RU: Награда из протокола
    const coinbase = this.createCoinbaseTx(minerAddress, reward, height); // EN: Create coinbase / DE: Coinbase erzeugen / RU: Создать coinbase
    const txs = [coinbase, ...transactions];         // EN: Coinbase must be first / DE: Coinbase zuerst / RU: Coinbase первой
    const block = new Block({                        // EN: Construct candidate / DE: Kandidat bauen / RU: Создать кандидат-блок
      index: height,                                 // EN: Height / DE: Höhe / RU: Высота
      previousHash: this.latest().hash,              // EN: Link to tip / DE: Verknüpfung zur Spitze / RU: Связь с вершиной
      timestamp: Date.now(),                         // EN: Now / DE: Jetzt / RU: Сейчас
      transactions: txs,                             // EN: Payload with coinbase / DE: Nutzlast mit Coinbase / RU: Нагрузка с coinbase
      difficulty: this.difficulty,                   // EN: Target / DE: Ziel / RU: Цель
      nonce: 0                                       // EN: Start nonce / DE: Start-Nonce / RU: Начальный nonce
    });                                              // EN: End object / DE: Ende Objekt / RU: Конец объекта
    block.mine();                                    // EN: Run PoW / DE: PoW ausführen / RU: Запуск PoW
    return this.addBlock(block);                     // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
  }


  // ---------- Mine using mempool ----------
  // EN: Pull txs from an external mempool and mine a block
  // DE: Txs aus externem Mempool holen und Block minen
  // RU: Забираем транзакции из внешнего мемпула и майним блок
mineFromMempool(mempool, maxTx = Infinity, opts = {}) { // EN: Drain mempool then mine / DE: Mempool leeren, dann minen / RU: Забрать мемпул и майнить
    if (!mempool || typeof mempool.takeAll !== 'function') throw new Error('mineFromMempool: mempool with takeAll() is required'); // EN/DE/RU: guard
    const txs = mempool.takeAll(maxTx);              // EN: Drain up to N / DE: Bis N entnehmen / RU: Забрать до N
    return this.mineBlock(txs, opts);                // EN: Mine with protocol reward / DE: Mit Protokoll-Reward minen / RU: Майнить с протокольной наградой
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
