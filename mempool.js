// mempool.js — Minimal pending-transactions pool                       // EN: Mempool module / DE: Mempool-Modul / RU: Модуль мемпула

class Mempool {                                                         // EN: Container class / DE: Container-Klasse / RU: Класс-контейнер
  constructor(validator = null, maxSize = 1000) {                       // EN: Optional validator & limit / DE: Optionaler Validator & Limit / RU: Необязательный валидатор и лимит
    this._items = [];                                                   // EN: Internal list / DE: Interne Liste / RU: Внутренний список
    this._validator = validator;                                        // EN: Save validator callback / DE: Validator-Callback speichern / RU: Сохраняем колбэк-валидатор
    this._maxSize = maxSize;                                            // EN: Capacity bound / DE: Kapazitätsgrenze / RU: Лимит ёмкости
  }

  size() { return this._items.length; }                                 // EN: Current count / DE: Aktuelle Anzahl / RU: Текущее количество

  _isDup(tx) {                                                          // EN: Duplicate check by (from, nonce) / DE: Duplikatprüfung nach (from, nonce) / RU: Проверка дубликата по (from, nonce)
    return this._items.some(e => e.tx.from === tx.from && e.tx.nonce === tx.nonce);
  }

  add(tx, signature = null, pubKey = null) {                            // EN: Add pending tx / DE: Pending-Tx hinzufügen / RU: Добавить неподтверждённую tx
    if (this.size() >= this._maxSize)                                   // EN: Capacity guard / DE: Kapazitätsgrenze / RU: Проверка лимита
      throw new Error('Mempool full');                                  // EN: Reject if full / DE: Ablehnen wenn voll / RU: Отклонить если переполнен

    if (this._isDup(tx))                                                // EN: No (from,nonce) duplicates / DE: Keine (from,nonce) Duplikate / RU: Запрет дубликатов (from, nonce)
      throw new Error('Duplicate (from, nonce) in mempool');            // EN: Explain reason / DE: Grund / RU: Причина

    if (this._validator) {                                              // EN: If a validator was provided / DE: Falls Validator übergeben / RU: Если передан валидатор
      const ok = this._validator(tx, signature, pubKey);                // EN: Run user validation / DE: Benutzer-Validierung ausführen / RU: Выполнить пользовательскую проверку
      if (!ok) throw new Error('Validation failed');                    // EN: Reject invalid tx / DE: Ungültige Tx ablehnen / RU: Отклонить при провале проверки
    }

    this._items.push({ tx, signature, pubKey });                        // EN: Store triplet / DE: Tripel speichern / RU: Сохраняем тройку
    return this.size();                                                 // EN: Return new size / DE: Neue Größe zurück / RU: Возвращаем размер
  }

  takeAll(maxCount = Infinity) {                                        // EN: Drain up to N txs / DE: Bis zu N Txs entnehmen / RU: Забрать до N транзакций
    const picked = this._items.splice(0, Math.min(maxCount, this.size())); // EN: Cut from front / DE: Vom Anfang abschneiden / RU: Срез с начала
    return picked.map(e => e.tx);                                       // EN: Return plain tx array / DE: Nur Tx-Array zurück / RU: Вернуть массив tx
  }

  peekAll() {                                                           // EN: Read-only snapshot / DE: Nur-Lesen-Schnappschuss / RU: Снимок только для чтения
    return this._items.map(e => ({ ...e }));                            // EN: Shallow copy / DE: Flache Kopie / RU: Поверхностная копия
  }

  clear() { this._items.length = 0; }                                   // EN: Remove everything / DE: Alles löschen / RU: Очистить всё
}

module.exports = Mempool;                                               // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
