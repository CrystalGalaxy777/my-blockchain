// @ts-nocheck

// transaction.js — Lesson 1: Digital signatures for transactions
// Урок 1: Цифровые подписи для транзакций / Учимся работать с транзакциями / Суть: транзакции → подписи → проверка → mempool.

// [RU] Подключаем модуль криптографии из Node.js
// [EN] Import the built-in cryptography module in Node.js
const crypto = require('crypto'); 

// ---------- 1. Генерация пары ключей (ECDSA secp256k1) ----------
// ---------- 1. Generate key pair (ECDSA secp256k1) ----------
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { // [RU] Создаём пару ключей (эллиптическая кривая) / [EN] Generate key pair (elliptic curve)
  namedCurve: 'secp256k1',                                           // [RU] Кривая, используемая в Bitcoin/Ethereum / [EN] Curve used in Bitcoin/Ethereum
  publicKeyEncoding: { type: 'spki', format: 'pem' },                // [RU] Формат публичного ключа PEM / [EN] Public key format PEM
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }               // [RU] Формат приватного ключа PEM / [EN] Private key format PEM
});

console.log("Private key:\n", privateKey);  // [RU] Выводим приватный ключ (не делать так в реальном проекте) / [EN] Print private key (do NOT do this in real projects)
console.log("Public key:\n", publicKey);    // [RU] Выводим публичный ключ / [EN] Print public key

// ---------- 2. Генерация адреса из публичного ключа ----------
// ---------- 2. Generate address from public key ----------
// 1. Берёт публичный ключ (в PEM-формате)
// 2. Превращает его в «сырой» бинарный вид
// 3. Пропускает через SHA-256
// 4. Берёт первые 20 байт
// 5. Добавляет префикс 0x
// Это даёт нам «короткий адрес», чтобы не таскать весь огромный публичный ключ
function toAddress(publicKeyPem) {
  // [RU] Хэшируем публичный ключ SHA-256 / [EN] Hash the public key using SHA-256
  const hash = crypto.createHash('sha256').update(publicKeyPem).digest('hex');
  // [RU] Берём первые 20 байт и добавляем префикс 0x / [EN] Take first 20 bytes and add 0x prefix
  return '0x' + hash.slice(0, 40);
}

const address = toAddress(publicKey);       
console.log("Address:", address);           // [RU] Печатаем адрес, производный от публичного ключа / [EN] Print derived address from public key

// ---------- 3. Создаём объект транзакции (пока тестовый) ----------
// ---------- 3. Create a transaction object (temporary test) ----------
/* 
  const tx = {
  from: "Alice",         // [RU] Отправитель (пока имя, позже заменим на address) / [EN] Sender (placeholder, will use address later)
  to: "Bob",             // [RU] Получатель (пока имя) / [EN] Receiver (placeholder)
  amount: 100,           // [RU] Сумма перевода / [EN] Transfer amount
  //nonce: Date.now()    // [RU] Одноразовое число (защита от повторов) / [EN] Nonce to prevent replay
  nonce: 1               // фиксируем nonce: теперь JSON/Hash не зависят от времени
};
console.log("TX (raw):", tx); // [RU] Выводим «сырой» объект / [EN] Print raw transaction object
*/

// ---------- 3. Создаём объект транзакции с реальным адресом ----------
// Создаём транзакцию (отправитель, получатель, сумма, nonce)
// [RU] Теперь отправитель = наш сгенерированный адрес (связан с публичным ключом).
// [EN] Now the sender equals our generated address (linked to the public key).
// [DE] Jetzt ist der Absender unsere generierte Adresse (mit dem öffentlichen Schlüssel verknüpft).

const tx = {
  from: address,                                   // [RU] Отправитель: наш адрес / [EN] Sender: our address / [DE] Absender: unsere Adresse
  to:   '0x96a23e4cd1fdea96c571cadfe6b5318abcee84cc',   // [RU] Получатель: временная заглушка / [EN] Receiver: placeholder / [DE] Empfänger: Platzhalter
  amount: 100,                                     // [RU] Сумма / [EN] Amount / [DE] Betrag
  nonce: 1                                         // [RU] Фиксированный нонс для стабильного вывода / [EN] Fixed nonce for stable output / [DE] Feste Nonce für stabile Ausgabe
};
console.log("TX (raw):", tx);                      // [RU] Проверим, что from = 0x… / [EN] Check from = 0x… / [DE] Prüfen, dass from = 0x…


// ---------- 4. Детерминированная сериализация и хэш / Считаем хэш транзакции----------
// ---------- 4. Deterministic serialization & hash ----------
// Если порядок полей не фиксировать подписи будут разные → сеть не сможет согласовать транзакции. Поэтому мы всегда делаем сериализацию в фиксированном порядке полей
function serializeTx(tx) {
  // [RU] Сортируем поля, чтобы подпись была одинакова у всех / [EN] Fix field order for consistent signatures
  const ordered = { from: tx.from, to: tx.to, amount: tx.amount, nonce: tx.nonce };
  return JSON.stringify(ordered); // [RU] Превращаем объект в строку JSON / [EN] Convert object to JSON string
}

function sha256(data) {
  // [RU] Вычисляем SHA-256 хэш / [EN] Compute SHA-256 hash
  return crypto.createHash('sha256').update(data).digest('hex');
}

const txJson = serializeTx(tx);             //[RU] Получаем строку транзакции в фиксированном формате / [EN] Get the string form of the transaction in fixed format.           
const txHash = sha256(txJson);              //[RU] Считаем хэш строки; это «отпечаток» данных, удобно для логов/ссылок / [EN] Compute the hash of that string; a compact fingerprint.           
console.log("TX JSON:", txJson);           // [RU] Печатаем JSON транзакции / [EN] Print transaction JSON
console.log("TX Hash:", txHash);           // [RU] Печатаем хэш транзакции / [EN] Print transaction hash

// ---------- 5. Подпись транзакции приватным ключом ----------
// ---------- 5. Sign transaction with private key ----------
function signTx(txJson, privateKeyPem) {
  const signer = crypto.createSign('SHA256');  // [RU] Создаём объект подписи (алгоритм SHA-256) / [EN] Create signing object (SHA-256)
  signer.update(txJson);                       // [RU] Добавляем данные / [EN] Feed data
  signer.end();                                // [RU] Завершаем ввод. Сообщаем, что данные закончились (закрываем поток для подписи)/ [EN] End data input.Indicate no more data is coming (finalize input)
  return signer.sign(privateKeyPem, 'hex');    // [RU] Подписываем данные приватным ключом и возвращаем подпись как hex-строку / [EN] Sign with the private key and return the signature as a hex string
}

const signature = signTx(txJson, privateKey);   // [RU] Вызываем функцию: на вход — JSON транзакции и наш приватный ключ; на выход — подпись / [EN] Call the function: input is tx JSON and our private key; output is the signature.
console.log("Signature (hex):", signature.slice(0, 48) + "…"); // [RU] Печатаем только начало подписи (она длинная), чтобы терминал не захламлять / [EN] Print only the beginning of the signature (it’s long) to keep output tidy.

// ---------- 6. Проверка подписи по публичному ключу ----------
// ---------- 6. Verify signature with public key ----------
function verifyTx(txJson, signatureHex, publicKeyPem) {
  const verifier = crypto.createVerify('SHA256'); // [RU] Создаём объект проверки подписи / [EN] Create verifier
  verifier.update(txJson);                        // [RU] Добавляем данные / [EN] Feed data
  verifier.end();                                 // [RU] Завершаем ввод / [EN] End data input
  return verifier.verify(publicKeyPem, signatureHex, 'hex'); // [RU] true, если подпись верна / [EN] true if signature is valid
}

console.log("Valid signature?", verifyTx(txJson, signature, publicKey)); // [RU] Проверка (true ожидается) / [EN] Should print true

// ---------- 7. Тест на подмену (изменение данных ломает подпись) ----------
// ---------- 7. Tamper test (data change breaks signature) ----------
const tampered = { ...tx, amount: 9999 };           // [RU] Создаём переменную с именем tampered. Ей присваиваем НОВЫЙ объект — копию исходной транзакции tx, но с изменённым полем amount / [EN] Create a variable named tampered. Assign a NEW object — a copy of the original transaction tx with a modified amount
                                                    // [RU] ...tx — это оператор распространения (spread): он копирует все поля объекта tx в новый объект. Затем мы перезаписываем поле amount значением 9999 / [EN] ...tx is the spread operator: it copies all fields of tx into a new object. Then we override the amount field with 9999
                                                    // [RU] Симулируем, как будто злоумышленник незаметно изменил данные после подписи (типичная попытка подделки) / [EN] We simulate an attacker silently changing data after it was signed (a typical forgery attempt).
const tamperedJson = serializeTx(tampered);         // [RU] Переменная tamperedJson — это JSON-строка от изменённой транзакции tampered, полученная через нашу функцию serializeTx. Почему через неё? нас детерминированная сериализация: фиксированный порядок полей. Это гарантирует, что хэш/подпись вычисляются одинаково у всех узлов / [EN] Variable tamperedJson — the JSON string of the modified transaction tampered, produced by serializeTx. Why? We rely on deterministic serialization: fixed field order. It ensures the hash/signature is computed identically across nodes.
console.log("Valid after tamper?", verifyTx(tamperedJson, signature, publicKey)); 
// tamperedJson: [RU] Это изменённые данные; они не совпадают с тем, что подписывалось / [EN] The modified data; it does not match what was signed.
// signature: [RU] Это подпись, сделанная по исходному txJson, а не по tamperedJson / [EN] Signature created for the original txJson, not for tamperedJson 
// publicKey: [RU] Публичный ключ владельца — по нему проверяем / [EN] The owner’s public key — used for verification
// [RU] Должно вывести false, потому что подпись привязана к исходным байтам. Любая подмена ломает проверку / [EN] Should print false, because the signature is bound to the original bytes. Any change breaks verification

// ---------- 8. Мини-мемпул: очередь неподтверждённых транзакций ----------
// [RU] "Мини-мемпул" — простая очередь, где временно лежат неподтверждённые транзакции.
// [EN] "Mini mempool" — a simple queue holding unconfirmed transactions temporarily.
// [DE] "Mini-Mempool" — einfache Warteschlange für unbestätigte Transaktionen.

const mempool = [];                                           // EN: Pending txs / DE: Ausstehende Txs / RU: Неподтверждённые транзакции

function addToMempool(txObj, sigHex, pubKeyPem) {             // EN: Validate & add / DE: Validieren & hinzufügen / RU: Проверить и добавить
  const canon = serializeTx(txObj);                           // EN: Canonical form / DE: Kanonische Form / RU: Каноничный вид
  if (!verifyTx(canon, sigHex, pubKeyPem))                    // EN: Bad signature? / DE: Schlechte Signatur? / RU: Подпись неверна?
    throw new Error('Invalid signature');                     // EN: Reject / DE: Ablehnen / RU: Отклонить
    
  if (txObj.from !== toAddress(pubKeyPem))                    // EN: Address must match pubkey / DE: Adresse muss zum Pubkey passen / RU: Адрес должен соответствовать pubkey
    throw new Error('From address does not match public key');// EN: Reject / DE: Ablehnen / RU: Отклонить

  const dup = mempool.some(e => e.tx.from === txObj.from && e.tx.nonce === txObj.nonce); // EN: Duplicate (from,nonce)? / DE: Duplikat (from,nonce)? / RU: Дубликат (from,nonce)?
  if (dup)                                                   // EN: If duplicate / DE: Falls Duplikat / RU: Если дубликат
    throw new Error('Duplicate (from, nonce) in mempool');   // EN: Reject / DE: Ablehnen / RU: Отклонить
  mempool.push({ tx: txObj, signature: sigHex });            // EN: Accept into mempool / DE: In Mempool aufnehmen / RU: Добавить в mempool
}                                                            // EN: End addToMempool / DE: Ende addToMempool / RU: Конец addToMempool

try {                                                        // [RU/EN/DE] Попытка добавления / Try add / Versuch hinzufügen
    addToMempool(tx, signature, publicKey);                  // [RU/EN/DE] Добавить подписанную tx / Add signed tx / Signierte Tx hinzufügen
} catch (e) {                                                // [RU/EN/DE] Перехват ошибки / Catch error / Fehler fangen
    console.log('Mempool reject:', e.message);               // [RU/EN/DE] Причина отказа / Rejection reason / Ablehnungsgrund
}

// ---------- Exports for tests (CommonJS) ----------
// EN: Export helpers so tests can import them
// DE: Exportiere Helfer, damit Tests sie importieren können
// RU: Экспортируем хелперы, чтобы тесты могли их подключать
module.exports = {
  serializeTx,   // EN/DE/RU: deterministic JSON of tx
  sha256,        // EN/DE/RU: SHA-256 helper
  signTx,        // EN/DE/RU: sign tx JSON with private key (PEM)
  verifyTx,      // EN/DE/RU: verify signature with public key (PEM)
  toAddress,     // EN/DE/RU: derive short address from public key (PEM)
  addToMempool   // EN/DE/RU: validate & push tx into mempool
};
