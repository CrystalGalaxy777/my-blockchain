// blockchain.js — Simple chain with PoW mining + balances/state // EN: PoW chain + balances / DE: PoW-Chain + Kontostände / RU: PoW-цепь + балансы

const Block = require('./block');                                   // EN: Use Block class / DE: Block-Klasse nutzen / RU: Используем класс Block

class Blockchain {                                                  // EN: Chain container / DE: Ketten-Container / RU: Контейнер цепочки
  constructor({ difficulty = 3, blockReward = 50, halvingInterval = null } = {}) { // EN: Protocol params / DE: Protokoll-Parameter / RU: Параметры протокола
    this.difficulty = difficulty;                                   // EN: PoW difficulty / DE: PoW-Schwierigkeit / RU: Сложность PoW
    this.blockReward = blockReward;                                 // EN: Base reward / DE: Basis-Reward / RU: Базовая награда
    this.halvingInterval = halvingInterval;                         // EN: Halving interval or null / DE: Halving-Intervall oder null / RU: Интервал халвинга или null
    this.chain = [this.createGenesisBlock()];                       // EN: Start with genesis / DE: Start mit Genesis / RU: Начинаем с генезиса
    this.state = new Map();                                         // EN: Balances map {addr->number} / DE: Salden-Map {addr->zahl} / RU: Балансы {адрес->число}
    this.lastNonce = new Map();                                     // EN: Last used nonce per sender / DE: Letzte Nonce pro Absender / RU: Последний nonce по адресу отправителя
  }

  createGenesisBlock() {                                            // EN: Build genesis / DE: Genesis bauen / RU: Создать генезис
    const b = new Block({                                           // EN: Construct block / DE: Block konstruieren / RU: Создаём блок
      index: 0,                                                     // EN: Height 0 / DE: Höhe 0 / RU: Высота 0
      previousHash: '0'.repeat(64),                                 // EN: Null prev-hash / DE: Null-Vorhash / RU: Нулевой предыдущий хэш
      timestamp: Date.now(),                                        // EN: Now / DE: Jetzt / RU: Сейчас
      transactions: [],                                             // EN: No txs in genesis / DE: Keine Txs im Genesis / RU: В генезисе нет tx
      difficulty: this.difficulty,                                  // EN: Same diff / DE: Gleiche Diff / RU: Та же сложность
      nonce: 0                                                      // EN: No mining / DE: Kein Mining / RU: Майнинг не нужен
    });
    return b;                                                       // EN: Return genesis / DE: Genesis zurückgeben / RU: Вернуть генезис
  }

  latest() { return this.chain[this.chain.length - 1]; }            // EN: Tail block / DE: Letzter Block / RU: Последний блок

  getCurrentReward(height) {                                        // EN: Reward at height / DE: Reward auf Höhe / RU: Награда на высоте
    if (!this.halvingInterval || height === 0) return this.blockReward; // EN: No halving or genesis / DE: Kein Halving oder Genesis / RU: Без халвинга или генезиса
    const eras = Math.floor(height / this.halvingInterval);         // EN: Number of eras passed / DE: Anzahl Epochen / RU: Кол-во эпох
    return this.blockReward / Math.pow(2, eras);                    // EN: Halve per era / DE: Pro Epoche halbieren / RU: Делим на 2 за эпоху
  }

  // ---------- State helpers ----------
  getBalance(addr) { return this.state.get(addr) || 0; }            // EN: Read balance / DE: Kontostand lesen / RU: Получить баланс
  setBalance(addr, value) { this.state.set(addr, value); }          // EN: Write balance / DE: Kontostand setzen / RU: Установить баланс
  credit(addr, amount) { this.setBalance(addr, this.getBalance(addr) + amount); } // EN: Add funds / DE: Guthaben erhöhen / RU: Зачислить средства
  debit(addr, amount) {                                             // EN: Subtract funds / DE: Guthaben verringern / RU: Списать средства
    const cur = this.getBalance(addr);                              // EN: Current balance / DE: Aktueller Stand / RU: Текущий баланс
    if (cur < amount) throw new Error('Insufficient balance');      // EN: Guard / DE: Absicherung / RU: Недостаточно средств
    this.setBalance(addr, cur - amount);                            // EN: Apply / DE: Anwenden / RU: Применить
  }
  getLastNonceOf(addr) { return this.lastNonce.get(addr) || 0; }    // EN: Read last nonce / DE: Letzte Nonce lesen / RU: Получить последний nonce
  bumpNonce(addr, nonce) { this.lastNonce.set(addr, nonce); }       // EN: Update last nonce / DE: Nonce aktualisieren / RU: Обновить nonce

  // ---------- Tx validation against current state ----------
  isCoinbaseTx(tx, height) { return tx && tx.from === null && tx.nonce === height; } // EN: Detect coinbase / DE: Coinbase erkennen / RU: Узнать coinbase
  validateCoinbaseTx(tx, height) {                                   // EN: Check coinbase fields / DE: Coinbase-Felder prüfen / RU: Проверить поля coinbase
    const expected = this.getCurrentReward(height);                  // EN: Expected reward / DE: Erwarteter Reward / RU: Ожидаемая награда
    if (!this.isCoinbaseTx(tx, height)) return false;                // EN: Must be coinbase / DE: Muss Coinbase sein / RU: Должна быть coinbase
    if (!tx.to) return false;                                        // EN: Must have recipient / DE: Empfänger nötig / RU: Нужен получатель
    if (typeof tx.amount !== 'number' || tx.amount !== expected) return false; // EN: Amount exact / DE: Betrag exakt / RU: Сумма точная
    return true;                                                     // EN: Valid coinbase / DE: Gültige Coinbase / RU: Валидная coinbase
  }
  validateTxAgainstState(tx) {                                       // EN: Validate normal tx / DE: Normale Tx prüfen / RU: Проверить обычную tx
    if (!tx || tx.from === null) return false;                       // EN: Not coinbase here / DE: Hier keine Coinbase / RU: Не coinbase здесь
    if (!tx.from || !tx.to) return false;                            // EN: Need from/to / DE: Braucht from/to / RU: Нужны from/to
    if (typeof tx.amount !== 'number' || tx.amount <= 0) return false; // EN: Positive amount / DE: Positiver Betrag / RU: Положительная сумма
    if (!Number.isInteger(tx.nonce) || tx.nonce <= this.getLastNonceOf(tx.from)) return false; // EN: Nonce strictly increases / DE: Nonce strikt steigend / RU: Nonce строго растёт
    if (this.getBalance(tx.from) < tx.amount) return false;          // EN: Enough balance / DE: Genug Guthaben / RU: Достаточно средств
    return true;                                                     // EN: Looks valid / DE: Wirkt gültig / RU: Похоже валидно
  }

  // ---------- Apply block to state (atomic) ----------
  applyBlockStateTransitions(block) {                                 // EN: Apply txs to balances / DE: Txs auf Salden anwenden / RU: Применить tx к балансам
    const height = block.index;                                       // EN: Block height / DE: Blockhöhe / RU: Высота блока
    const txs = block.transactions || [];                              // EN: Tx list / DE: Tx-Liste / RU: Список tx
    if (txs.length === 0) throw new Error('Block has no transactions'); // EN: Must include coinbase / DE: Muss Coinbase enthalten / RU: Должна быть coinbase
    const coinbase = txs[0];                                          // EN: First tx / DE: Erste Tx / RU: Первая tx
    if (!this.validateCoinbaseTx(coinbase, height)) throw new Error('Invalid coinbase transaction'); // EN: Guard / DE: Absicherung / RU: Проверка
    this.credit(coinbase.to, coinbase.amount);                        // EN: Pay miner / DE: Miner auszahlen / RU: Начислить майнеру

    for (let i = 1; i < txs.length; i++) {                            // EN: Iterate normal txs / DE: Normale Txs iterieren / RU: Обычные tx
      const t = txs[i];                                               // EN: Current tx / DE: Aktuelle Tx / RU: Текущая tx
      if (!this.validateTxAgainstState(t)) throw new Error(`Invalid tx at index ${i}`); // EN: Validate / DE: Prüfen / RU: Проверка
      this.debit(t.from, t.amount);                                   // EN: Subtract sender / DE: Sender belasten / RU: Списать у отправителя
      this.credit(t.to, t.amount);                                    // EN: Credit recipient / DE: Empfänger gutschreiben / RU: Зачислить получателю
      this.bumpNonce(t.from, t.nonce);                                // EN: Advance sender nonce / DE: Sender-Nonce erhöhen / RU: Обновить nonce отправителя
    }
  }

  // ---------- Coinbase helper for mining ----------
  createCoinbaseTx(minerAddress, reward, height) {                    // EN: Build coinbase tx / DE: Coinbase-Tx bauen / RU: Создать coinbase-транзакцию
    return { from: null, to: minerAddress, amount: reward, nonce: height }; // EN: Minimal shape / DE: Minimale Form / RU: Минимальная форма
  }

  addBlock(block) {                                                   // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
    const tip = this.latest();                                        // EN: Current tip / DE: Aktuelle Spitze / RU: Текущая вершина
    if (block.index !== tip.index + 1) throw new Error('Bad index');  // EN: Height check / DE: Höhen-Check / RU: Проверка высоты
    if (block.previousHash !== tip.hash) throw new Error('Bad prevHash'); // EN: Link check / DE: Verknüpfungs-Check / RU: Проверка связи
    if (!block.meetsDifficulty()) throw new Error('Not mined');       // EN: PoW must hold / DE: PoW muss gelten / RU: Должен соблюдаться PoW
    if (block.computeHash() !== block.hash) throw new Error('Hash mismatch'); // EN: Integrity / DE: Integrität / RU: Целостность
    this.applyBlockStateTransitions(block);                           // EN: Apply state changes / DE: Zustandsänderungen anwenden / RU: Применить изменения состояния
    this.chain.push(block);                                           // EN: Append block / DE: Block anhängen / RU: Добавить блок
    return block;                                                     // EN: Done / DE: Fertig / RU: Готово
  }

  mineBlock(transactions = [], opts = {}) {                           // EN: Build→coinbase→mine→add / DE: Bauen→Coinbase→minen→anhängen / RU: Собрать→coinbase→майнить→добавить
    const { minerAddress } = opts;                                    // EN: Miner address required / DE: Miner-Adresse erforderlich / RU: Нужен адрес майнера
    if (!minerAddress) throw new Error('minerAddress is required for coinbase'); // EN: Guard / DE: Absicherung / RU: Проверка
    const height = this.latest().index + 1;                           // EN: Next height / DE: Nächste Höhe / RU: Следующая высота
    const reward = this.getCurrentReward(height);                     // EN: Reward from protocol / DE: Reward aus Protokoll / RU: Награда протокола
    const coinbase = this.createCoinbaseTx(minerAddress, reward, height); // EN: Create coinbase / DE: Coinbase erzeugen / RU: Создать coinbase
    const txs = [coinbase, ...transactions];                          // EN: Coinbase first / DE: Coinbase zuerst / RU: Coinbase первой
    const block = new Block({                                         // EN: Construct candidate / DE: Kandidat bauen / RU: Создать кандидат-блок
      index: height,                                                  // EN: Height / DE: Höhe / RU: Высота
      previousHash: this.latest().hash,                               // EN: Link to tip / DE: Verknüpfung zur Spitze / RU: Связь с вершиной
      timestamp: Date.now(),                                          // EN: Now / DE: Jetzt / RU: Сейчас
      transactions: txs,                                              // EN: Payload / DE: Nutzlast / RU: Нагрузка
      difficulty: this.difficulty,                                    // EN: Target / DE: Ziel / RU: Цель
      nonce: 0                                                        // EN: Start nonce / DE: Start-Nonce / RU: Начальный nonce
    });
    block.mine();                                                     // EN: Run PoW / DE: PoW ausführen / RU: Запуск PoW
    return this.addBlock(block);                                      // EN: Validate→apply→append / DE: Validieren→anwenden→anhängen / RU: Проверить→применить→добавить
  }

  mineFromMempool(mempool, maxTx = Infinity, opts = {}) {             // EN: Drain mempool then mine / DE: Mempool leeren, dann minen / RU: Забрать мемпул и майнить
    if (!mempool || typeof mempool.takeAll !== 'function') throw new Error('mineFromMempool: mempool with takeAll() is required'); // EN/DE/RU: Guard
    const txs = mempool.takeAll(maxTx);                               // EN: Take up to N / DE: Bis N entnehmen / RU: Взять до N
    return this.mineBlock(txs, opts);                                 // EN: Mine with coinbase / DE: Mit Coinbase minen / RU: Майнить с coinbase
  }

  isValid() {                                                         // EN: Structural chain check / DE: Strukturelle Kettenprüfung / RU: Структурная проверка цепи
    for (let i = 1; i < this.chain.length; i++) {                     // EN: Walk chain / DE: Kette durchlaufen / RU: Проходим цепь
      const prev = this.chain[i - 1];                                 // EN: Prev block / DE: Voriger Block / RU: Предыдущий блок
      const cur  = this.chain[i];                                     // EN: Cur block / DE: Aktueller Block / RU: Текущий блок
      if (cur.previousHash !== prev.hash) return false;               // EN: Link ok? / DE: Link ok? / RU: Связь ок?
      if (!cur.meetsDifficulty()) return false;                       // EN: PoW ok? / DE: PoW ok? / RU: PoW ок?
      if (cur.computeHash() !== cur.hash) return false;               // EN: Hash ok? / DE: Hash ok? / RU: Хэш ок?
    }
    return true;                                                      // EN: Looks consistent / DE: Wirkt konsistent / RU: Выглядит консистентно
  }
}

module.exports = Blockchain;                                          // EN: Export / DE: Export / RU: Экспорт
