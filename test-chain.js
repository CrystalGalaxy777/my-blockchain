// test-chain.js — fund sender, then transfer // EN: Fund→pay flow / DE: Erst finanzieren, dann zahlen / RU: Сначала пополнить, потом платить
const Blockchain = require('./blockchain');                                   // EN: Import chain from root / DE: Import Kette aus Root / RU: Импорт блокчейна из корня

const miner = '0xtestminer';                                                  // EN: Miner address / DE: Miner-Adresse / RU: Адрес майнера
const alice = '0xaaa';                                                        // EN: Sender (Alice) / DE: Absender (Alice) / RU: Отправитель (Алиса)
const bob   = '0xbbb';                                                        // EN: Recipient (Bob) / DE: Empfänger (Bob) / RU: Получатель (Боб)

const chain = new Blockchain({ difficulty: 2, blockReward: 50 });             // EN: Easier PoW + reward / DE: Einfacher PoW + Reward / RU: Упрощённый PoW + награда

console.log('Genesis hash:', chain.latest().hash);                             // EN/DE/RU: Печатаем хэш генезиса

console.log('⛏ Block #1: coinbase to miner...');                              // EN: Only coinbase / DE: Nur Coinbase / RU: Только coinbase
chain.mineBlock([], { minerAddress: miner });                                  // EN: Miner gets 50 / DE: Miner erhält 50 / RU: Майнер получает 50

console.log('⛏ Block #2: fund Alice from miner (nonce=1)...');                // EN: Fund sender / DE: Sender finanzieren / RU: Пополнить отправителя
chain.mineBlock([{ from: miner, to: alice, amount: 10, nonce: 1 }],            // EN: Transfer 10 to Alice / DE: 10 an Alice / RU: 10 Алисе
                { minerAddress: miner });                                       // EN: Include new coinbase / DE: Neue Coinbase / RU: Новая coinbase

console.log('⛏ Block #3: Alice pays Bob 5 (nonce=1)...');                     // EN: Now Alice can pay / DE: Jetzt kann Alice zahlen / RU: Теперь Алиса может платить
chain.mineBlock([{ from: alice, to: bob, amount: 5, nonce: 1 }],               // EN: Spend 5 / DE: 5 senden / RU: Отправить 5
                { minerAddress: miner });                                       // EN: Include coinbase / DE: Coinbase einfügen / RU: Добавить coinbase

console.log('Chain valid?', chain.isValid());                                   // EN: Should be true / DE: Sollte true sein / RU: Должно быть true
