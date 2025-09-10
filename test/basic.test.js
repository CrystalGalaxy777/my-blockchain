// EN: Minimal sanity tests (CommonJS) for portfolio repo
// DE: Minimale Sanity-Tests (CommonJS) für das Portfolio-Repo
// RU: Минимальные sanity-тесты (CommonJS) для портфолио-репо

const assert = require("assert");   // EN: Node core assertions / DE: Node-Assertions / RU: Ассерты Node.js
const crypto = require("crypto");   // EN: Built-in crypto / DE: Eingebaute Krypto / RU: Встроенный crypto

// EN: Import helpers from our implementation
// DE: Importe Hilfsfunktionen aus unserer Implementierung
// RU: Импортируем хелперы из нашей реализации
// const { serializeTx, sha256 } = require("../transaction.js");
const { serializeTx, sha256 } = require("../tx-crypto.js");


// ---------- Fixture / Testdaten / Тестовые данные ----------
const tx = { from: "a", to: "b", amount: 10, nonce: 1 }; // EN: Minimal tx / DE: Minimale Tx / RU: Минимальная транзакция

// ---------- Test 1: deterministic serialization ----------
// EN: Field order must be fixed → reproducible signatures
// DE: Feste Feldreihenfolge → reproduzierbare Signaturen
// RU: Фиксированный порядок полей → воспроизводимые подписи
const ser = serializeTx(tx);
assert.strictEqual(
  ser,
  JSON.stringify({ from: "a", to: "b", amount: 10, nonce: 1 }),
  "serializeTx() must produce deterministic JSON"
);

// ---------- Test 2: sha256 helper correctness ----------
// EN: Our sha256() must equal Node's crypto SHA-256
// DE: Unser sha256() muss dem Node-crypto SHA-256 entsprechen
// RU: Наш sha256() должен совпадать с SHA-256 из crypto
const nodeHash = crypto.createHash("sha256").update("test").digest("hex"); // EN/DE/RU: Эталонный хэш через crypto
const helperHash = sha256("test");                                         // EN/DE/RU: Хэш через нашу функцию
assert.strictEqual(helperHash, nodeHash, "sha256() must match Node crypto output");
assert.strictEqual(helperHash.length, 64, "sha256() must return 64 hex chars");

// ---------- Test 3: ignore extra fields in serializeTx ----------
// EN: Extra props must not affect canonical form
// DE: Zusätzliche Felder dürfen die kanonische Form nicht beeinflussen
// RU: Лишние поля не должны влиять на каноничную форму
const txWithExtra = { ...tx, foo: 123, bar: "x" };
assert.strictEqual(
  serializeTx(txWithExtra),
  ser,
  "serializeTx() must ignore non-specified fields"
);

console.log("✅ All basic tests passed");
