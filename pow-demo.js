// pow-demo.js — Visual PoW demo with spinner & stable timestamp        // EN: Visual PoW / DE: Visuelles PoW / RU: Визуальный PoW
// Этот файл нужен для того чтобы наглядно увидеть и понять, как работает Proof-of-Work (PoW):

const Block = require('./block');                                       // EN: Import Block / DE: Block importieren / RU: Импорт блока

// --- CLI args (simple parser) ------------------------------------------------
const argv = process.argv.slice(2);                                     // EN: CLI args list / DE: CLI-Argumente / RU: Аргументы CLI
const hasFlag = (f) => argv.includes(f) || argv.includes(f.replace('--', '-')); // EN: Flag helper / DE: Flag-Helfer / RU: Помощник флагов
const getNum = (name, def) => {                                         // EN: Read numeric flag / DE: Numerisches Flag lesen / RU: Чтение числового флага
  const i = argv.findIndex(a => a === name || a === name.replace('--','-')); // EN: Find flag index / DE: Index finden / RU: Найти индекс флага
  if (i >= 0 && argv[i+1] && !argv[i+1].startsWith('-')) return Number(argv[i+1]); // EN: Next is value? / DE: Nächstes ist Wert? / RU: Следом значение?
  return def;                                                           // EN: Default / DE: Standard / RU: По умолчанию
};

const difficulty      = getNum('--difficulty', 3);                      // EN: Global difficulty / DE: Globale Difficulty / RU: Общая сложность
const maxIter         = getNum('--maxIter', 1e7);                       // EN: Max iterations / DE: Maximale Iterationen / RU: Макс. итераций
const logEvery        = getNum('--logEvery', 50_000);                   // EN: Progress step / DE: Fortschrittsschritt / RU: Шаг прогресса
const timestampStable = hasFlag('--timestampStable') || hasFlag('-t');  // EN: Fix timestamp / DE: Timestamp fixieren / RU: Фиксировать timestamp
const noSpinner       = hasFlag('--noSpinner');                         // EN: Disable spinner / DE: Spinner deaktivieren / RU: Выключить спиннер

console.log(`Params → difficulty=${difficulty}, maxIter=${maxIter}, logEvery=${logEvery}, timestampStable=${timestampStable}`); // EN/DE/RU: Параметры

// --- Build candidate block ---------------------------------------------------
const fixedTs = Date.now();                                             // EN: Capture start time / DE: Startzeit erfassen / RU: Фиксируем стартовое время
const b = new Block({                                                   // EN: Candidate block / DE: Kandidatenblock / RU: Блок-кандидат
  index:        1,                                                      // EN: Height / DE: Höhe / RU: Высота
  previousHash: '00',                                                   // EN: Dummy prev hash / DE: Dummy-Vorhash / RU: Заглушка prev hash
  timestamp:    timestampStable ? fixedTs : Date.now(),                 // EN: Stable timestamp if -t / DE: Stabil bei -t / RU: Стабильный если -t
  transactions: [],                                                     // EN: Empty payload / DE: Leere Nutzlast / RU: Пустая нагрузка
  difficulty,                                                           // EN: Target difficulty / DE: Ziel-Difficulty / RU: Целевая сложность
  nonce:        0                                                       // EN: Start nonce / DE: Start-Nonce / RU: Начальный nonce
});

// --- Spinner (visual feedback) ----------------------------------------------
const frames = ['|','/','-','\\'];                                     // EN: Spinner frames / DE: Spinner-Frames / RU: Кадры спиннера
let spinIdx = 0;                                                        // EN: Frame index / DE: Frame-Index / RU: Индекс кадра
let spinner;                                                            // EN: Interval ref / DE: Intervall-Ref / RU: Ссылка интервала
if (!noSpinner) {                                                       // EN: Enable spinner? / DE: Spinner an? / RU: Включать спиннер?
  spinner = setInterval(() => {                                         // EN: Tick / DE: Tick / RU: Тик
    process.stdout.write(`\r${frames[spinIdx = (spinIdx+1)%frames.length]} mining… nonce=${b.nonce}`); // EN/DE/RU: Строка статуса
  }, 80);                                                               // EN: 80 ms / DE: 80 ms / RU: 80 мс
}

// --- Manual mining loop (for visualization) ---------------------------------
let attempts = 0;                                                       // EN: Iteration counter / DE: Iterationszähler / RU: Счётчик попыток
const prefix = '0'.repeat(difficulty);                                 // EN: Target prefix / DE: Zielpräfix / RU: Целевой префикс
const t0 = Date.now();                                                 // EN: Start time / DE: Startzeit / RU: Время старта

console.log('\n⛏ Mining…');                                            // EN/DE/RU: Запуск майнинга

while (!b.hash.startsWith(prefix)) {                                   // EN: Until matches / DE: Bis passend / RU: Пока не совпадёт
  b.nonce++;                                                           // EN: Change nonce / DE: Nonce erhöhen / RU: Увеличиваем nonce
  b.recomputeHash();                                                   // EN: Recompute hash / DE: Hash neu berechnen / RU: Пересчитываем хэш
  attempts++;                                                          // EN: Count / DE: Zählen / RU: Счёт

  if (attempts % logEvery === 0) {                                     // EN: Periodic log / DE: Periodisches Log / RU: Периодический лог
    const dt = (Date.now() - t0) / 1000;                               // EN: Seconds / DE: Sekunden / RU: Секунды
    const rate = Math.floor(attempts / (dt || 1));                     // EN: Attempts/sec / DE: Versuche/Sek / RU: Попыток/сек
    process.stdout.write(`\r… attempts=${attempts}, nonce=${b.nonce}, rate≈${rate}/s`); // EN/DE/RU: Прогресс
  }

  if (attempts >= maxIter) {                                           // EN: Safety stop / DE: Sicherheitsstopp / RU: Стоп-защита
    if (spinner) clearInterval(spinner);                               // EN: Stop spinner / DE: Spinner stoppen / RU: Остановить спиннер
    const dt = (Date.now() - t0) / 1000;                               // EN: Seconds / DE: Sekunden / RU: Секунды
    console.error(`\n❌ Gave up after ${attempts} attempts in ${dt.toFixed(2)}s`); // EN/DE/RU: Отказ по лимиту
    process.exit(1);                                                   // EN: Exit error / DE: Fehler-Exit / RU: Выход с ошибкой
  }
}

if (spinner) clearInterval(spinner);                                   // EN: Stop spinner / DE: Spinner stoppen / RU: Остановить спиннер
process.stdout.write('\r');                                            // EN: Clear spinner line / DE: Zeile säubern / RU: Очистить строку

const t1 = Date.now();                                                 // EN: End time / DE: Endzeit / RU: Время окончания
const elapsed = (t1 - t0) / 1000;                                      // EN: Seconds / DE: Sekunden / RU: Секунды
const rate = Math.floor(attempts / (elapsed || 1));                    // EN: Attempts/sec / DE: Versuche/Sek / RU: Попыток/сек

// --- Result -----------------------------------------------------------------
console.log('✅ Mined!');                                              // [RU] Успешный майнинг / [EN] Mining successful / [DE] Mining erfolgreich
console.log(`Hash:      ${b.hash}`);                                   // [RU] Хэш блока / [EN] Block hash / [DE] Block-Hash
console.log(`Nonce:     ${b.nonce}`);                                  // [RU] Найденный nonce / [EN] Found nonce / [DE] Gefundene Nonce
console.log(`Attempts:  ${attempts}`);                                 // [RU] Количество попыток / [EN] Number of attempts / [DE] Anzahl der Versuche
console.log(`Time:      ${elapsed.toFixed(2)} s`);                     // [RU] Время майнинга (сек) / [EN] Mining time (s) / [DE] Mining-Zeit (Sekunden)
console.log(`Rate≈      ${rate}/s`);                                   // [RU] Скорость перебора (попыток/сек) / [EN] Attempts per second / [DE] Versuche pro Sekunde
console.log(`Timestamp: ${b.timestamp}  (stable=${timestampStable})`); // [RU] Метка времени (стабильная?) / [EN] Timestamp (stable?) / [DE] Zeitstempel (stabil?)

