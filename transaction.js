// transaction.js — Lesson 1: Digital signatures for transactions
// Урок 1: Цифровые подписи для транзакций

const crypto = require('crypto'); // [RU] Встроенный модуль Node.js для криптографии
                                  // [EN] Built-in Node.js module for cryptography

// ---------- 1. Generate ECDSA key pair (secp256k1) ----------
// ---------- 1. Генерация пары ключей ECDSA (secp256k1) ----------
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',                                  // [RU] Кривая, используемая в Bitcoin/Ethereum
                                                            // [EN] Curve used in Bitcoin/Ethereum
  publicKeyEncoding: { type: 'spki', format: 'pem' },       // [RU] Формат публичного ключа (PEM)
                                                            // [EN] Public key encoding (PEM)
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }      // [RU] Формат приватного ключа (PEM)
                                                            // [EN] Private key encoding (PEM)
});

console.log("Private key:\n", privateKey); // [RU] Приватный ключ (держать в секрете!)
                                           // [EN] Private key (keep it secret!)
console.log("Public key:\n", publicKey);   // [RU] Публичный ключ (можно публиковать)
                                           // [EN] Public key (safe to share)

// ---------- 2. Create a minimal transaction object ----------
// ---------- 2. Создаём минимальный объект транзакции ----------
const tx = {
  from: "Alice",        // [RU] Отправитель (пока просто имя)
                         // [EN] Sender (just a label for now)
  to: "Bob",            // [RU] Получатель (пока имя)
                         // [EN] Receiver (just a label for now)
  amount: 100,          // [RU] Сумма перевода
                         // [EN] Transfer amount
  nonce: Date.now()     // [RU] Одноразовое число для защиты от повторного воспроизведения
                         // [EN] Nonce: prevents replay attacks
};
console.log("TX (raw):", tx);

// ---------- 3. Deterministic serialization & hashing ----------
// ---------- 3. Детерминированная сериализация и хэширование ----------
function serializeTx(tx) {
  // [RU] Фиксируем порядок полей, чтобы хэш/подпись совпадали у всех
  // [EN] Fix field order so hash/signature matches across nodes
  const ordered = { from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce };
  return JSON.stringify(ordered);
}

function sha256(data) {
  // [RU] Вычисляем SHA-256 хэш
  // [EN] Compute SHA-256 hash
  return crypto.createHash('sha256').update(data).digest('hex');
}

const txJson = serializeTx(tx);
const txHash = sha256(txJson);
console.log("TX JSON:", txJson);
console.log("TX Hash:", txHash);

// ---------- 4. Sign the transaction with private key ----------
// ---------- 4. Подписываем транзакцию приватным ключом ----------
function signTx(txJson, privateKeyPem) {
  const signer = crypto.createSign('SHA256');   // [RU] Создаём объект подписи (SHA-256)
                                                // [EN] Create signature object (SHA-256)
  signer.update(txJson);                        // [RU] Добавляем данные (JSON транзакции)
                                                // [EN] Feed transaction JSON into signer
  signer.end();                                 // [RU] Завершаем подачу данных
                                                // [EN] End data input
  return signer.sign(privateKeyPem, 'hex');     // [RU] Получаем подпись в hex
                                                // [EN] Generate signature in hex
}

const signature = signTx(txJson, privateKey);
console.log("Signature (hex):", signature.slice(0, 48) + "…");

// ---------- 5. Verify the signature with public key ----------
// ---------- 5. Проверяем подпись публичным ключом ----------
function verifyTx(txJson, signatureHex, publicKeyPem) {
  const verifier = crypto.createVerify('SHA256'); // [RU] Создаём объект проверки подписи
                                                  // [EN] Create signature verifier
  verifier.update(txJson);                        // [RU] Добавляем данные (JSON транзакции)
                                                  // [EN] Feed transaction JSON into verifier
  verifier.end();                                 // [RU] Завершаем ввод данных
                                                  // [EN] End data input
  return verifier.verify(publicKeyPem, signatureHex, 'hex'); // [RU] true, если подпись верна
                                                             // [EN] true if signature is valid
}

console.log("Valid signature?", verifyTx(txJson, signature, publicKey));

// ---------- 6. Tamper test (modifying amount breaks signature) ----------
// ---------- 6. Тест на подмену (изменение суммы ломает подпись) ----------
const tampered = { ...tx, amount: 9999 };
const tamperedJson = serializeTx(tampered);
console.log("Valid after tamper?", verifyTx(tamperedJson, signature, publicKey)); // false expected
