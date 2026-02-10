# 🚀 Инструкция загрузки на GitHub

## 📋 Что загружать для БОТА

### ✅ ЗАГРУЖАТЬ на GitHub:

```
TeenX/
├── bot.py                    ✅ ДА (токен теперь в переменных)
├── requirements.txt          ✅ ДА
├── .gitignore               ✅ ДА
├── .env.example             ✅ ДА (пример без реальных данных)
├── README.md                ✅ ДА
├── DEPLOYMENT_GUIDE.md      ✅ ДА
└── SETUP_GUIDE.md           ✅ ДА
```

### ❌ НЕ ЗАГРУЖАТЬ на GitHub:

```
TeenX/
├── serviceAccountKey.json   ❌ НЕТ! (секретный ключ Firebase)
├── .env                     ❌ НЕТ! (ваши реальные токены)
└── __pycache__/            ❌ НЕТ! (кэш Python)
```

---

## 🔧 Подготовка перед загрузкой

### 1. Создайте файл .env (НЕ загружать на GitHub!)

```bash
cd C:\Users\malik\CascadeProjects\TeenX
```

Создайте файл `.env` со своими данными:
```
TELEGRAM_BOT_TOKEN=8379880726:AAF8wIjUEWluEPBKLGe4j1iPl04wMW-bj18
TELEGRAM_ADMIN_ID=7682446178
```

### 2. Проверьте .gitignore

Убедитесь что файл `.gitignore` содержит:
```
# Firebase Private Keys
serviceAccountKey.json

# Environment variables
.env
.env.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
```

### 3. Установите новую зависимость

```bash
pip install python-dotenv
```

---

## 🚀 Загрузка на GitHub

### Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на https://github.com
2. Нажмите **"New repository"**
3. Название: `teenx-hub`
4. Описание: `Платформа для работы подростков 14-18 лет в Казахстане`
5. **ВАЖНО**: Выберите **"Private"** (не Public!)
6. НЕ создавайте README (он уже есть)
7. Нажмите **"Create repository"**

### Шаг 2: Загрузите код

```bash
# Перейдите в папку проекта
cd C:\Users\malik\CascadeProjects\TeenX

# Инициализируйте Git
git init

# Добавьте все файлы
git add .

# Проверьте что добавилось (НЕ должно быть .env и serviceAccountKey.json!)
git status

# Сохраните изменения
git commit -m "Initial commit: TeenX Hub platform"

# Подключите к GitHub (замените YOUR_USERNAME на ваш username)
git remote add origin https://github.com/YOUR_USERNAME/teenx-hub.git

# Загрузите на GitHub
git branch -M main
git push -u origin main
```

### Шаг 3: Проверьте на GitHub

Зайдите на https://github.com/YOUR_USERNAME/teenx-hub

**Должны быть загружены:**
- ✅ bot.py (без реального токена)
- ✅ requirements.txt
- ✅ .gitignore
- ✅ .env.example
- ✅ README.md
- ✅ Папка web/ со всеми файлами

**НЕ должны быть загружены:**
- ❌ serviceAccountKey.json
- ❌ .env
- ❌ __pycache__/
- ❌ node_modules/

---

## 🔒 Безопасность

### ✅ Теперь безопасно:
- Токен бота хранится в `.env` (не на GitHub)
- `serviceAccountKey.json` в `.gitignore`
- Репозиторий приватный

### ⚠️ Если случайно загрузили секреты:

1. **Немедленно** удалите репозиторий на GitHub
2. Создайте **новый токен** бота через @BotFather
3. Создайте **новый ключ** Firebase
4. Создайте новый репозиторий и загрузите заново

---

## 📥 Как использовать на другом компьютере

### 1. Клонируйте репозиторий
```bash
git clone https://github.com/YOUR_USERNAME/teenx-hub.git
cd teenx-hub
```

### 2. Создайте .env файл
```bash
# Скопируйте пример
cp .env.example .env

# Откройте и заполните своими данными
notepad .env
```

### 3. Добавьте serviceAccountKey.json
Скачайте из Firebase Console и положите в корень проекта

### 4. Установите зависимости
```bash
# Python
pip install -r requirements.txt

# Node.js
cd web
npm install
```

### 5. Запустите
```bash
# Бот
python bot.py

# Web (в другом терминале)
cd web
npm run dev
```

---

## 💡 Полезные команды

```bash
# Посмотреть что изменилось
git status

# Добавить изменения
git add .

# Сохранить изменения
git commit -m "Описание изменений"

# Загрузить на GitHub
git push

# Скачать изменения с GitHub
git pull
```

---

## ✅ Чек-лист перед загрузкой

- [ ] Создал `.env` с реальными токенами (НЕ загружать!)
- [ ] Проверил что `bot.py` использует `os.getenv()`
- [ ] Проверил что `.gitignore` содержит `.env` и `serviceAccountKey.json`
- [ ] Установил `python-dotenv`: `pip install python-dotenv`
- [ ] Создал репозиторий как **Private**
- [ ] Запустил `git status` и убедился что `.env` НЕ в списке

---

## 📞 Нужна помощь?

- **Telegram**: @lutafx
- **Email**: querty482901@gmail.com
- **WhatsApp**: +7 776 075 24 63
