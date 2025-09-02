// blockchain.js — Chapter 4: Minimal Blockchain (JS)                                // [RU/EN/DE] Простейшая цепочка блоков / Minimal blockchain / Minimale Blockchain
const { Block, simpleTxRoot, sha256Hex, serializeHeader } = require('./block');     // [RU/EN/DE] Импорт блока и утилит / Import block & utils / Block & Utils importieren

class Blockchain {                                                                   // [RU/EN/DE] Класс цепочки / Blockchain class / Blockchain-Klasse
  constructor() {                                                                   
    this.chain = [ new Block(0, '0'.repeat(64), []) ];                               // [RU/EN/DE] Генезис-блок в цепи / Genesis block in chain / Genesis-Block in Kette
  }                                                                                  // Генезис-блок = самый первый, у него нет предыдущего.Чтобы структура не ломалась (ведь поле prevHash обязано быть), туда кладут строку из 64 нулей. Это как «заглушка» → символическое начало цепи.

  tip() {                                                                            // [RU/EN/DE] Последний блок / Last block / Letzter Block
    return this.chain[this.chain.length - 1];                                        // [RU/EN/DE] Вернуть хвост массива / Return array tail / Arrayende zurückgeben
  }                                                                                  

  addBlock(txs) {                                                                     // [RU/EN/DE] Добавить новый блок / Add new block / Neuen Block hinzufügen
    const list = Array.isArray(txs) ? txs : [];                                      // [RU/EN/DE] Нормализуем вход в массив / Normalize input to array / Eingabe zu Array normalisieren
    const prev = this.tip();                                                         // [RU/EN/DE] Текущий последний блок / Current tip / Aktuelle Spitze
    const b = new Block(prev.header.index + 1, prev.hash, list);                     // [RU/EN/DE] Новый блок со ссылкой назад / New block linking back / Neuer Block mit Rückverweis

    if (b.header.prevHash !== prev.hash) throw new Error('Broken prevHash link');    // [RU/EN/DE] Проверка связи / Link check / Verknüpfungsprüfung
    if (b.header.txRoot !== simpleTxRoot(b.txs)) throw new Error('Bad txRoot');      // [RU/EN/DE] Контроль корня tx / Tx-root check / Tx-Root prüfen

    const recomputed = sha256Hex(serializeHeader(b.header));                         // [RU/EN/DE] Пересчитать хэш заголовка / Recompute header hash / Header-Hash neu berechnen
    if (recomputed !== b.hash) throw new Error('Header hash mismatch');              // [RU/EN/DE] Сравнить с записанным / Compare with stored / Mit gespeichertem vergleichen

    this.chain.push(b);                                                              // [RU/EN/DE] Принять блок в цепь / Append block to chain / Block an Kette anhängen
    return b;                                                                        // [RU/EN/DE] Вернуть добавленный блок / Return added block / Hinzugefügten Block zurückgeben
  }                                                                                  

  isValid() {                                                                         // [RU/EN/DE] Проверка целостности цепи / Chain integrity check / Kettenintegritätsprüfung
    for (let i = 1; i < this.chain.length; i++) {                                    // [RU/EN/DE] Идём по блокам с 1 / Iterate from 1 / Ab 1 iterieren
      const prev = this.chain[i - 1];                                                // [RU/EN/DE] Предыдущий блок / Previous block / Vorheriger Block
      const cur  = this.chain[i];                                                    // [RU/EN/DE] Текущий блок / Current block / Aktueller Block

      if (cur.header.prevHash !== prev.hash) return false;                           // [RU/EN/DE] Нарушена ссылка назад / Back link broken / Rückverweis defekt
      if (cur.header.txRoot !== simpleTxRoot(cur.txs)) return false;                 // [RU/EN/DE] Неверный txRoot / Wrong txRoot / Falscher Tx-Root

      const h = sha256Hex(serializeHeader(cur.header));                              // [RU/EN/DE] Пересчёт хэша заголовка / Recompute header hash / Header-Hash neu berechnen
      if (h !== cur.hash) return false;                                              // [RU/EN/DE] Хэш не совпал / Hash mismatch / Hash stimmt nicht
    }
    return true;                                                                      // [RU/EN/DE] Цепь валидна / Chain is valid / Kette ist gültig
  }                                                                                  
}                                                                                    

module.exports = { Blockchain };                                                     // [RU/EN/DE] Экспорт класса / Export class / Klasse exportieren
