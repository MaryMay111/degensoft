const fs = require('fs');
const CryptoJS = require('crypto-js');
const { langEN, langRU } = require('./translate');
const passKey = document.getElementById('pass-key')
const logs = document.getElementById('logs-text');
const fileInput = document.getElementById("wallet_file");
const fileName = document.querySelector('label[for="wallet_file"]');
const walletCount = document.getElementById('wallet_count');
const start = document.getElementById('start');
const langEnBtn = document.getElementById("lang_en");
const langRuBtn = document.getElementById("lang_ru");
let language = 'RU';

const changeLanguage = (lang) => {
    // Отримуємо всі текстові елементи з класом починаючимся на "lang_"
    const langElements = document.querySelectorAll("[class^='lang_']");

    // Для кожного елемента змінюємо його вміст на відповідний переклад
    langElements.forEach(element => {
        const elementClass = element.classList[0];
        const key = elementClass.substring(5); // Витягуємо ключ перекладу з імені класу
        if (lang[key]) {
            element.innerHTML = lang[key];
        }
    });
}

langEnBtn.addEventListener("click", () => {
    changeLanguage(langEN);
    language = "EN";
});

langRuBtn.addEventListener("click", () => {
    changeLanguage(langRU);
    language = "RU";
});

let KeyGlobal = [];

function parseFile() {
        const filePaths = fileInput.files[0].path;
        fs.readFile(filePaths, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            let keys = data.toString().split('\r\n');
            let filterKeys = keys.filter(key => key.trim() !== '');
            fileName.innerHTML = fileInput.files[0].name;
            walletCount.innerText = filterKeys.length;
            addLogs(`<span class="lang_info"></span> | <span class="lang_wallets"></span> |` +
                ` <span class="lang_loaded"></span> ${filterKeys.length} `)
            KeyGlobal = filterKeys;
        });
    }

function writeToFile(lines, filePath) {
    const content = lines.join('\n'); // Объединяем строки массива с помощью символа новой строки
    fs.writeFileSync(filePath, content); // Записываем содержимое в файл
    addLogs(`<span class="lang_process-end"></span>: ${filePath}`);
}

function addLogs(data) {
    logs.innerHTML += `<li> ${data} </li>`;
    switch (language) {
        case "RU":
            changeLanguage(langRU)
            break;
        case "EN":
            changeLanguage(langEN)
            break;
    }
    logs.scrollTop = logs.scrollHeight - logs.clientHeight;
}

function encryptPrivateKey(privateKey, password) {
    // Преобразование приватного ключа в байтовый массив
    const privateKeyBytes = CryptoJS.enc.Hex.parse(privateKey);

    // Процесс генерации ключа из пароля с использованием PBKDF2
    const key = CryptoJS.PBKDF2(password, CryptoJS.SHA256(password), { keySize: 256 / 32 });

    // Шифрование ключа с помощью AES
    const ciphertext = CryptoJS.AES.encrypt(privateKeyBytes, key, { mode: CryptoJS.mode.ECB });

    // Возвращение зашифрованного приватного ключа в формате Base64
    return ciphertext.toString();
}

function encryptAll() {
    addLogs(`<span class="lang_process-start"></span>`);
    if(!fileInput.files[0]) return  addLogs(`<span class="lang_error"></span> | <span class="lang_choose-wallets"></span>`);
    if(passKey.value === "") return  addLogs(`<span class="lang_error"></span> | <span class="lang_enter-pass"></span>`);
    const filePath = fileInput.files[0].path.replace(/\.txt$/, '_hash' + '.txt');
    let encryptData = [];
    KeyGlobal.forEach((el, i) => {
        encryptData.push(encryptPrivateKey(el, passKey.value));
    });
    writeToFile(encryptData, filePath);
}

fileInput.addEventListener("change", parseFile);
start.addEventListener('click', encryptAll);
