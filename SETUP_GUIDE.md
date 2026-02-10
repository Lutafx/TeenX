# 📚 Полный гайд по настройке TeenX Hub

## 🗂️ Что делать с каждым файлом

### 📁 Корневая папка TeenX/

#### 1. **bot.py** - Telegram бот
**Что это**: Основной файл Telegram бота для уведомлений и модерации

**Что делать**:
1. Откройте файл
2. Найдите строки:
   ```python
   TOKEN = "8379880726:AAF8wIjUEWluEPBKLGe4j1iPl04wMW-bj18"
   ADMIN_ID = 7682446178
   ```
3. Замените на свои данные:
   - `TOKEN` - получите от @BotFather в Telegram
   - `ADMIN_ID` - ваш Telegram ID (получите от @userinfobot)

**Загружать на GitHub**: ✅ ДА (но сначала замените токен на переменную окружения)

---

#### 2. **serviceAccountKey.json** - Firebase ключ
**Что это**: Секретный ключ для доступа бота к Firebase

**Что делать**:
1. Скачайте из Firebase Console → Project Settings → Service Accounts → Generate New Private Key
2. Сохраните файл как `serviceAccountKey.json` в корне проекта

**Загружать на GitHub**: ❌ НЕТ! Уже в .gitignore

---

#### 3. **requirements.txt** - Python зависимости
**Что это**: Список библиотек для Python бота

**Что делать**:
```bash
pip install -r requirements.txt
```

**Загружать на GitHub**: ✅ ДА

---

#### 4. **.gitignore** - Игнорируемые файлы
**Что это**: Список файлов, которые НЕ загружаются на GitHub

**Что делать**: Ничего, уже настроен

**Загружать на GitHub**: ✅ ДА

---

#### 5. **README.md** - Описание проекта
**Что это**: Главное описание проекта

**Что делать**: Можете отредактировать под себя

**Загружать на GitHub**: ✅ ДА

---

#### 6. **DEPLOYMENT_GUIDE.md** - Руководство по развертыванию
**Что это**: Инструкция как запустить проект на сервере

**Что делать**: Читать когда будете деплоить

**Загружать на GitHub**: ✅ ДА

---

### 📁 Папка web/ - Веб-приложение

#### 7. **package.json** - Node.js зависимости
**Что это**: Список библиотек для React приложения

**Что делать**:
```bash
cd web
npm install
```

**Загружать на GitHub**: ✅ ДА

---

#### 8. **vite.config.js, tailwind.config.js, postcss.config.js** - Конфигурации
**Что это**: Настройки сборщика и стилей

**Что делать**: Ничего, уже настроены

**Загружать на GitHub**: ✅ ДА

---

#### 9. **index.html** - Главная HTML страница
**Что это**: Точка входа веб-приложения

**Что делать**: Ничего

**Загружать на GitHub**: ✅ ДА

---

#### 10. **.env.example** - Пример переменных окружения
**Что это**: Шаблон для настройки Firebase

**Что делать**:
1. Скопируйте файл:
   ```bash
   cp .env.example .env
   ```
2. Откройте `.env` и заполните:
   ```
   VITE_FIREBASE_API_KEY=ваш_ключ
   VITE_FIREBASE_AUTH_DOMAIN=ваш_домен
   VITE_FIREBASE_PROJECT_ID=ваш_проект
   VITE_FIREBASE_STORAGE_BUCKET=ваш_бакет
   VITE_FIREBASE_MESSAGING_SENDER_ID=ваш_sender_id
   VITE_FIREBASE_APP_ID=ваш_app_id
   ```
3. Получите данные из Firebase Console → Project Settings → Your apps

**Загружать на GitHub**: 
- `.env.example` - ✅ ДА
- `.env` - ❌ НЕТ! (уже в .gitignore)

---

### 📁 Папка web/src/ - Исходный код

#### 11. **main.jsx** - Точка входа React
**Что это**: Запускает React приложение

**Что делать**: Ничего

**Загружать на GitHub**: ✅ ДА

---

#### 12. **App.jsx** - Главный компонент
**Что это**: Роутинг и структура приложения

**Что делать**: Ничего

**Загружать на GitHub**: ✅ ДА

---

#### 13. **index.css** - Глобальные стили
**Что это**: TailwindCSS стили

**Что делать**: Ничего

**Загружать на GitHub**: ✅ ДА

---

#### 14. **firebase.js** - Конфигурация Firebase
**Что это**: Подключение к Firebase

**Что делать**:
1. Откройте файл
2. Замените тестовые данные на реальные из Firebase Console:
   ```javascript
   const firebaseConfig = {
     apiKey: "ваш_настоящий_ключ",
     authDomain: "teenx-hub.firebaseapp.com",
     projectId: "teenx-hub",
     storageBucket: "teenx-hub.firebasestorage.app",
     messagingSenderId: "ваш_sender_id",
     appId: "ваш_app_id"
   };
   ```

**Загружать на GitHub**: ✅ ДА (но лучше использовать переменные из .env)

---

### 📁 Папка web/src/components/ - Компоненты

#### 15. **Header.jsx** - Шапка сайта
**Что это**: Навигация с логотипом и меню

**Что делать**: Ничего (или можете изменить дизайн)

**Загружать на GitHub**: ✅ ДА

---

#### 16. **Footer.jsx** - Подвал сайта
**Что это**: Футер с контактами

**Что делать**: Можете изменить контакты на свои

**Загружать на GitHub**: ✅ ДА

---

### 📁 Папка web/src/pages/ - Страницы

#### 17-22. **HomePage.jsx, VacanciesPage.jsx, JobDetailPage.jsx, AddVacancyPage.jsx, DocumentsPage.jsx, AdminPage.jsx**
**Что это**: Все страницы сайта

**Что делать**: Ничего (или можете редактировать контент)

**Загружать на GitHub**: ✅ ДА

---

## 🚀 Пошаговая инструкция загрузки на GitHub

### Шаг 1: Создайте репозиторий на GitHub
1. Зайдите на https://github.com
2. Нажмите "New repository"
3. Название: `teenx-hub`
4. Описание: "Платформа для работы подростков 14-18 лет"
5. Выберите "Private" (чтобы скрыть токены)
6. НЕ создавайте README (он уже есть)
7. Нажмите "Create repository"

### Шаг 2: Инициализируйте Git локально
```bash
cd C:\Users\malik\CascadeProjects\TeenX
git init
git add .
git commit -m "Initial commit: TeenX Hub platform"
```

### Шаг 3: Подключите к GitHub
```bash
git remote add origin https://github.com/ваш_username/teenx-hub.git
git branch -M main
git push -u origin main
```

### Шаг 4: Проверьте что загрузилось
Зайдите на GitHub и убедитесь что:
- ✅ Загрузились все файлы кроме:
  - `serviceAccountKey.json`
  - `.env`
  - `node_modules/`
  - `dist/`

---

## ⚠️ ВАЖНО: Безопасность

### Файлы которые НЕ ДОЛЖНЫ попасть на GitHub:
1. **serviceAccountKey.json** - секретный ключ Firebase
2. **.env** - ваши API ключи
3. **node_modules/** - библиотеки (устанавливаются через npm)
4. **dist/** - собранные файлы

Эти файлы уже добавлены в `.gitignore` и автоматически игнорируются.

### Если случайно загрузили секреты:
1. Немедленно удалите репозиторий
2. Создайте новый
3. Смените все токены и ключи в Firebase и Telegram

---

## 📋 Чек-лист перед загрузкой

- [ ] Заменили токен бота на переменную окружения
- [ ] Проверили что `.gitignore` содержит:
  ```
  serviceAccountKey.json
  .env
  .env.local
  node_modules/
  dist/
  ```
- [ ] Удалили реальные API ключи из `firebase.js` (используйте .env)
- [ ] Создали репозиторий как **Private**
- [ ] Добавили README с описанием

---

## 🎯 Что делать после загрузки

1. **Клонируйте на другом компьютере**:
   ```bash
   git clone https://github.com/ваш_username/teenx-hub.git
   cd teenx-hub
   ```

2. **Установите зависимости**:
   ```bash
   # Python бот
   pip install -r requirements.txt
   
   # Web приложение
   cd web
   npm install
   ```

3. **Настройте окружение**:
   - Создайте `.env` из `.env.example`
   - Добавьте `serviceAccountKey.json`
   - Обновите токены в `bot.py`

4. **Запустите**:
   ```bash
   # Бот
   python bot.py
   
   # Web
   cd web
   npm run dev
   ```

---

## 💡 Полезные команды Git

```bash
# Проверить статус
git status

# Добавить изменения
git add .

# Сохранить изменения
git commit -m "Описание изменений"

# Загрузить на GitHub
git push

# Скачать изменения
git pull

# Посмотреть историю
git log
```

---

## 📞 Нужна помощь?

- **Telegram**: @lutafx
- **Email**: querty482901@gmail.com
- **WhatsApp**: +7 776 075 24 63
