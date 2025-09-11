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

  mineBlock(transactions = []) {           // EN: Build→mine→add / DE: Bauen→minen→hinzufügen / RU: Создать→майнить→добавить
    const block = new Block({
      index: this.latest().index + 1,      // EN: Next height / DE: Nächste Höhe / RU: Следующая высота
      previousHash: this.latest().hash,    // EN: Link to tip / DE: Verknüpfung zur Spitze / RU: Связь с вершиной
      timestamp: Date.now(),               // EN: Now / DE: Jetzt / RU: Сейчас
      transactions,                        // EN: Payload / DE: Nutzlast / RU: Полезная нагрузка
      difficulty: this.difficulty,         // EN: Target / DE: Ziel / RU: Цель
      nonce: 0                             // EN: Start nonce / DE: Start-Nonce / RU: Начальный nonce
    });
    block.mine();                          // EN: PoW loop / DE: PoW-Schleife / RU: Цикл PoW
    return this.addBlock(block);           // EN: Validate & append / DE: Validieren & anhängen / RU: Проверить и добавить
  }

  // ---------- Mine using mempool ----------
  // EN: Pull txs from an external mempool and mine a block
  // DE: Txs aus externem Mempool holen und Block minen
  // RU: Забираем транзакции из внешнего мемпула и майним блок
  mineFromMempool(mempool, maxTx = Infinity) {
    if (!mempool || typeof mempool.takeAll !== 'function') { // EN/DE/RU: guard
      throw new Error('mineFromMempool: mempool with takeAll() is required');
    }
    const txs = mempool.takeAll(maxTx);  // EN: Drain up to N / DE: Bis N entnehmen / RU: Забрать до N
    return this.mineBlock(txs);          // EN: Reuse flow / DE: Flow wiederverwenden / RU: Повторно используем логику
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
