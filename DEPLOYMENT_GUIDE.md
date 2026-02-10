# 🚀 Руководство по развертыванию TeenX Hub

## Обзор системы

TeenX Hub состоит из двух компонентов:
1. **Web приложение** (React + Firebase) - основной сайт
2. **Telegram бот** (Python) - уведомления и модерация

## 📋 Предварительные требования

- Node.js 18+ и npm
- Python 3.8+
- Firebase проект
- Telegram Bot Token

## 🔧 Настройка Firebase

### 1. Создайте Firebase проект

1. Перейдите на https://console.firebase.google.com
2. Создайте новый проект "teenx-hub"
3. Включите Firestore Database
4. Включите Authentication (Email/Password)
5. Включите Storage

### 2. Настройте Firestore

Создайте следующие коллекции:

**jobs** (вакансии):
```javascript
{
  title: string,
  companyName: string,
  companyDescription: string,
  city: string,
  salaryFrom: number,
  salaryTo: number,
  paymentType: string,
  paymentSchedule: string,
  experience: string,
  employmentType: string,
  schedule: string,
  workingHours: string,
  workFormat: string,
  minAge: number,
  responsibilities: string,
  requirements: string,
  benefits: string,
  contactPhone: string,
  contactEmail: string,
  contactName: string,
  status: string, // 'pending', 'active', 'rejected'
  createdAt: timestamp,
  approvedAt: timestamp
}
```

**users** (пользователи):
```javascript
{
  name: string,
  email: string,
  type: string, // 'teen' или 'employer'
  age: number,
  verified: string, // 'pending', 'yes', 'no'
  docUrl: string,
  telegramId: number,
  createdAt: timestamp
}
```

**applications** (отклики):
```javascript
{
  jobId: string,
  jobTitle: string,
  employerId: string,
  name: string,
  age: number,
  phone: string,
  email: string,
  message: string,
  status: string, // 'pending', 'viewed', 'accepted', 'rejected'
  createdAt: timestamp
}
```

### 3. Настройте правила безопасности Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    
    match /applications/{applicationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Получите конфигурацию

1. В Firebase Console → Project Settings → General
2. Скопируйте конфигурацию Web App
3. Обновите `web/src/firebase.js`

### 5. Создайте Service Account для бота

1. Firebase Console → Project Settings → Service Accounts
2. Generate New Private Key
3. Сохраните как `serviceAccountKey.json` в корне проекта
4. **НЕ ЗАГРУЖАЙТЕ этот файл в Git!**

## 🌐 Развертывание Web приложения

### Локальная разработка

```bash
cd web
npm install
npm run dev
```

Откройте http://localhost:3000

### Production сборка

```bash
npm run build
```

Файлы будут в `web/dist/`

### Деплой на Netlify

1. Установите Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Деплой:
```bash
cd web
netlify deploy --prod
```

### Деплой на Vercel

```bash
npm install -g vercel
cd web
vercel --prod
```

### Деплой на Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🤖 Развертывание Telegram бота

### 1. Создайте Telegram бота

1. Напишите @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Сохраните токен

### 2. Настройте бота

Обновите `bot.py`:
```python
TOKEN = "ваш_токен_бота"
ADMIN_ID = ваш_telegram_id  # Получите через @userinfobot
```

### 3. Установите зависимости

```bash
pip install -r requirements.txt
```

### 4. Запустите бота

```bash
python bot.py
```

### 5. Деплой на сервер (VPS)

#### Используя systemd (Linux):

Создайте `/etc/systemd/system/teenx-bot.service`:

```ini
[Unit]
Description=TeenX Telegram Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/TeenX
ExecStart=/usr/bin/python3 /path/to/TeenX/bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Запустите:
```bash
sudo systemctl enable teenx-bot
sudo systemctl start teenx-bot
sudo systemctl status teenx-bot
```

#### Используя Docker:

Создайте `Dockerfile`:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "bot.py"]
```

Запустите:
```bash
docker build -t teenx-bot .
docker run -d --name teenx-bot --restart always teenx-bot
```

## 🔐 Переменные окружения

### Web приложение (.env)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Telegram бот
- Храните `serviceAccountKey.json` в безопасности
- Не коммитьте в Git

## ✅ Проверка развертывания

1. **Web приложение**:
   - Откройте сайт
   - Проверьте все страницы
   - Попробуйте добавить вакансию
   - Проверьте отклик на вакансию

2. **Telegram бот**:
   - Отправьте `/start`
   - Проверьте `/admin` (только для админа)
   - Добавьте вакансию на сайте - должно прийти уведомление в Telegram

3. **Интеграция**:
   - Добавьте вакансию → проверьте модерацию в боте
   - Одобрите в боте → проверьте на сайте
   - Проверьте уведомления подписчиков

## 🐛 Устранение неполадок

### Бот не получает уведомления
- Проверьте `serviceAccountKey.json`
- Убедитесь, что Firebase правильно настроен
- Проверьте логи бота

### Вакансии не отображаются
- Проверьте правила Firestore
- Убедитесь, что статус вакансии 'active'
- Проверьте консоль браузера

### Ошибки при деплое
- Проверьте версии Node.js и npm
- Очистите кэш: `npm clean-cache --force`
- Удалите node_modules и переустановите

## 📞 Поддержка

- **Telegram**: @lutafx
- **Email**: querty482901@gmail.com
- **WhatsApp**: +7 776 075 24 63

## 🎉 Готово!

Ваша платформа TeenX Hub готова к работе!
