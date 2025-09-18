// state.js — Minimal account state (balances)              // EN: Minimal account state / DE: Minimaler Account-State / RU: Минимальное состояние аккаунтов

class State {                                              // EN: Encapsulate balances map / DE: Kapselt Balances-Map / RU: Инкапсулируем карту балансов
  constructor() {                                          // EN: Init container / DE: Container initialisieren / RU: Инициализация контейнера
    this._balances = new Map();                            // EN: Use Map for clarity / DE: Map für Übersicht / RU: Map для наглядности
  }                                                        // EN / DE / RU

  _getRaw(addr) {                                          // EN: Internal raw getter / DE: Interner Roh-Getter / RU: Внутренний геттер без нормализации
    return this._balances.get(addr) ?? 0;                  // EN: Missing → 0 / DE: Fehlend → 0 / RU: Нет записи → 0
  }                                                        // EN / DE / RU

  get(addr) {                                              // EN: Public balance getter / DE: Öffentlicher Getter / RU: Публичный геттер баланса
    return Number(this._getRaw(addr));                     // EN: Always a number / DE: Immer Zahl / RU: Всегда число
  }                                                        // EN / DE / RU

  set(addr, amount) {                                      // EN: Set absolute balance / DE: Absoluten Saldo setzen / RU: Установить абсолютный баланс
    if (amount < 0) throw new Error('State.set: negative'); // EN: Disallow negative / DE: Negative verbieten / RU: Запрет отрицательных
    this._balances.set(addr, Number(amount));              // EN: Store normalized / DE: Normalisiert speichern / RU: Сохраняем нормализовано
    return this.get(addr);                                  // EN: Return new balance / DE: Neuen Saldo zurück / RU: Возвращаем новый баланс
  }                                                        // EN / DE / RU

  credit(addr, amount) {                                   // EN: Increase balance / DE: Saldo erhöhen / RU: Увеличить баланс
    if (amount < 0) throw new Error('State.credit: negative'); // EN: Guard / DE: Absicherung / RU: Защита
    const next = this.get(addr) + Number(amount);          // EN: Sum up / DE: Aufsummieren / RU: Складываем
    this._balances.set(addr, next);                        // EN: Save / DE: Speichern / RU: Сохраняем
    return next;                                           // EN: Return new balance / DE: Neuen Saldo / RU: Новый баланс
  }                                                        // EN / DE / RU

  debit(addr, amount) {                                    // EN: Decrease balance / DE: Saldo verringern / RU: Уменьшить баланс
    if (amount < 0) throw new Error('State.debit: negative'); // EN: Guard / DE: Absicherung / RU: Защита
    const cur = this.get(addr);                            // EN: Read current / DE: Aktuell lesen / RU: Текущий баланс
    if (cur < amount) return false;                        // EN: Not enough funds / DE: Zu wenig Guthaben / RU: Недостаточно средств
    this._balances.set(addr, cur - Number(amount));        // EN: Apply debit / DE: Abbuchen / RU: Списать
    return true;                                           // EN: Success / DE: Erfolg / RU: Успех
  }                                                        // EN / DE / RU

  snapshot() {                                             // EN: Shallow snapshot / DE: Schnappschuss / RU: Снимок состояния
    return Array.from(this._balances.entries());           // EN: For debug/log / DE: Für Debug/Log / RU: Для отладки/логов
  }                                                        // EN / DE / RU
}                                                          // EN / DE / RU

module.exports = State;                                    // EN: Export class / DE: Klasse exportieren / RU: Экспорт класса
