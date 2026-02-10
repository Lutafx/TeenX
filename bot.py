import telebot
import firebase_admin
from firebase_admin import credentials, firestore, storage
from telebot import types
import time
import threading
from datetime import datetime
import os
import sys
from dotenv import load_dotenv

# Исправление кодировки для Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Загрузка переменных окружения
load_dotenv()

# --- КОНФИГУРАЦИЯ ---
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', 'your_bot_token_here')
ADMIN_ID = int(os.getenv('TELEGRAM_ADMIN_ID', '0'))

# Инициализация Firebase
try:
    # Загружаем credentials из файла (НЕ загружай этот файл в GitHub!)
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'teenx-hub.firebasestorage.app'
    })
    db = firestore.client()
    print("✅ Firebase подключен!")
except Exception as e:
    print(f"⚠️ Firebase не подключен: {e}")
    print("Бот будет работать в ограниченном режиме")
    db = None

bot = telebot.TeleBot(TOKEN)

# Хранилище подписчиков (в памяти, можно перенести в Firebase)
subscribers = set()
last_job_count = 0


# --- ФУНКЦИИ РАБОТЫ С FIREBASE ---
def get_active_jobs():
    """Получить активные вакансии из Firebase"""
    if not db:
        return []
    
    try:
        jobs_ref = db.collection('jobs')
        query = jobs_ref.where('status', '==', 'active').stream()
        
        jobs = []
        for doc in query:
            job_data = doc.to_dict()
            job_data['id'] = doc.id
            jobs.append(job_data)
        
        return jobs
    except Exception as e:
        print(f"Ошибка загрузки вакансий: {e}")
        return []


def get_pending_verifications():
    """Получить пользователей на верификации"""
    if not db:
        return []
    
    try:
        users_ref = db.collection('users')
        query = users_ref.where('verified', '==', 'pending').stream()
        
        users = []
        for doc in query:
            user_data = doc.to_dict()
            user_data['uid'] = doc.id
            users.append(user_data)
        
        return users
    except Exception as e:
        print(f"Ошибка загрузки верификаций: {e}")
        return []


def update_user_verification(uid, status):
    """Обновить статус верификации пользователя"""
    if not db:
        return False
    
    try:
        user_ref = db.collection('users').document(uid)
        user_ref.update({'verified': status})
        return True
    except Exception as e:
        print(f"Ошибка обновления верификации: {e}")
        return False


def save_telegram_id(uid, telegram_id):
    """Сохранить Telegram ID пользователя"""
    if not db:
        return False
    
    try:
        user_ref = db.collection('users').document(uid)
        user_ref.update({'telegramId': telegram_id})
        return True
    except Exception as e:
        print(f"Ошибка сохранения Telegram ID: {e}")
        return False


def get_pending_jobs():
    """Получить вакансии на модерации"""
    if not db:
        return []
    
    try:
        jobs_ref = db.collection('jobs')
        query = jobs_ref.where('status', '==', 'pending').stream()
        
        jobs = []
        for doc in query:
            job_data = doc.to_dict()
            job_data['id'] = doc.id
            jobs.append(job_data)
        
        return jobs
    except Exception as e:
        print(f"Ошибка загрузки вакансий на модерации: {e}")
        return []


def approve_job(job_id):
    """Одобрить вакансию"""
    if not db:
        return False
    
    try:
        job_ref = db.collection('jobs').document(job_id)
        job_ref.update({
            'status': 'active',
            'approvedAt': firestore.SERVER_TIMESTAMP
        })
        return True
    except Exception as e:
        print(f"Ошибка одобрения вакансии: {e}")
        return False


def reject_job(job_id, reason=''):
    """Отклонить вакансию"""
    if not db:
        return False
    
    try:
        job_ref = db.collection('jobs').document(job_id)
        job_ref.update({
            'status': 'rejected',
            'rejectedAt': firestore.SERVER_TIMESTAMP,
            'rejectionReason': reason
        })
        return True
    except Exception as e:
        print(f"Ошибка отклонения вакансии: {e}")
        return False


# --- КОМАНДЫ БОТА ---
@bot.message_handler(commands=['start'])
def send_welcome(message):
    """Приветствие и главное меню"""
    user_id = message.from_user.id
    subscribers.add(user_id)  # Автоматически подписываем
    
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("🔍 Вакансии", callback_data="show_jobs"),
        types.InlineKeyboardButton("🔔 Уведомления", callback_data="toggle_notifications"),
        types.InlineKeyboardButton("👤 Профиль", callback_data="profile_info"),
        types.InlineKeyboardButton("🛡️ Юр. помощь", callback_data="legal_help"),
        types.InlineKeyboardButton("🌐 Открыть сайт", url="https://teenx.kz")
    )
    
    welcome_text = (
        f"👋 *Привет, {message.from_user.first_name}!*\n\n"
        "🦄 *TeenX Hub* — твой проводник в мир легальной работы!\n\n"
        "✨ *Что я умею:*\n"
        "• 🔔 Мгновенные уведомления о новых вакансиях\n"
        "• 📋 Показываю только проверенные предложения\n"
        "• ⚡ Синхронизация с сайтом в реальном времени\n"
        "• 🛡️ Защита твоих прав\n\n"
        "🔥 *Уведомления включены!* Ты первым узнаешь о новых вакансиях."
    )
    
    bot.send_message(
        message.chat.id,
        welcome_text,
        reply_markup=markup,
        parse_mode="Markdown"
    )


@bot.message_handler(commands=['admin'])
def admin_panel(message):
    """Админ-панель"""
    if message.from_user.id != ADMIN_ID:
        bot.reply_to(message, "⛔ У тебя нет доступа к админ-панели!")
        return
    
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("� Вакансии", callback_data="admin_jobs"),
        types.InlineKeyboardButton("👥 Верификации", callback_data="admin_verifications"),
        types.InlineKeyboardButton("📊 Статистика", callback_data="admin_stats")
    )
    
    bot.send_message(
        message.chat.id,
        "🛡️ *Админ-панель TeenX*\n\nВыбери действие:",
        reply_markup=markup,
        parse_mode="Markdown"
    )


@bot.message_handler(commands=['stats'])
def show_stats(message):
    """Статистика бота"""
    if message.from_user.id != ADMIN_ID:
        return
    
    jobs = get_active_jobs()
    pending_verifications = get_pending_verifications()
    
    stats_text = (
        f"📊 *Статистика TeenX Bot*\n\n"
        f"👥 Подписчиков: *{len(subscribers)}*\n"
        f"💼 Активных вакансий: *{len(jobs)}*\n"
        f"⏳ На верификации: *{len(pending_verifications)}*\n"
        f"🤖 Статус: *Онлайн*"
    )
    
    bot.send_message(message.chat.id, stats_text, parse_mode="Markdown")


# --- ОБРАБОТКА КНОПОК ---
@bot.callback_query_handler(func=lambda call: True)
def handle_query(call):
    """Обработка всех callback кнопок"""
    
    # 1. Показать вакансии
    if call.data == "show_jobs":
        bot.answer_callback_query(call.id, "Загружаю вакансии...")
        jobs = get_active_jobs()
        
        if not jobs:
            bot.send_message(
                call.message.chat.id,
                "📭 *Пока нет активных вакансий*\n\n"
                "Но не переживай! Как только появится что-то подходящее, "
                "я сразу тебе сообщу 🔔",
                parse_mode="Markdown"
            )
            return
        
        bot.send_message(
            call.message.chat.id,
            f"🔥 *Найдено {len(jobs)} вакансий:*",
            parse_mode="Markdown"
        )
        
        for job in jobs:
            send_job_card(call.message.chat.id, job)
    
    # 2. Переключить уведомления
    elif call.data == "toggle_notifications":
        user_id = call.from_user.id
        
        if user_id in subscribers:
            subscribers.remove(user_id)
            bot.answer_callback_query(call.id, "🔕 Уведомления отключены")
            bot.send_message(
                call.message.chat.id,
                "🔕 *Уведомления отключены*\n\n"
                "Ты больше не будешь получать оповещения о новых вакансиях.\n"
                "Чтобы включить снова, нажми кнопку 🔔",
                parse_mode="Markdown"
            )
        else:
            subscribers.add(user_id)
            bot.answer_callback_query(call.id, "🔔 Уведомления включены!")
            bot.send_message(
                call.message.chat.id,
                "🔔 *Уведомления включены!*\n\n"
                "Теперь ты будешь первым узнавать о новых вакансиях 🚀",
                parse_mode="Markdown"
            )
    
    # 3. Профиль
    elif call.data == "profile_info":
        bot.answer_callback_query(call.id)
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton("🌐 Открыть профиль", url="https://teenx.kz"))
        
        bot.send_message(
            call.message.chat.id,
            "👤 *Твой профиль*\n\n"
            "Для управления профилем и загрузки документов используй сайт.\n"
            "Бот автоматически синхронизируется с твоим статусом верификации!",
            reply_markup=markup,
            parse_mode="Markdown"
        )
    
    # 4. Юридическая помощь
    elif call.data == "legal_help":
        bot.answer_callback_query(call.id)
        legal_text = (
            "🛡️ *Твои права (Трудовой Кодекс РК)*\n\n"
            "📌 *14-16 лет:*\n"
            "• Не более 24 часов в неделю\n"
            "• Только с согласия родителей\n"
            "• Запрещены ночные смены (22:00-06:00)\n"
            "• Легкий труд без вреда здоровью\n\n"
            "📌 *16-18 лет:*\n"
            "• Не более 36 часов в неделю\n"
            "• Запрещены ночные смены\n"
            "• Ежегодный отпуск 31 день\n\n"
            "⚠️ *Если нарушают твои права:*\n"
            "Пиши @alikhan_ceo — мы поможем!"
        )
        bot.send_message(call.message.chat.id, legal_text, parse_mode="Markdown")
    
    # 5. Админ - модерация
    elif call.data == "admin_moderate":
        if call.from_user.id != ADMIN_ID:
            bot.answer_callback_query(call.id, "⛔ Доступ запрещен")
            return
        
        bot.answer_callback_query(call.id)
        bot.send_message(
            call.message.chat.id,
            "📋 *Модерация вакансий*\n\n"
            "Зайди в админку на сайте для модерации вакансий.\n"
            "Бот автоматически разошлет одобренные вакансии всем подписчикам!",
            parse_mode="Markdown"
        )
    
    # 6. Админ - верификации
    elif call.data == "admin_verifications":
        if call.from_user.id != ADMIN_ID:
            bot.answer_callback_query(call.id, "⛔ Доступ запрещен")
            return
        
        bot.answer_callback_query(call.id, "Загружаю...")
        pending = get_pending_verifications()
        
        if not pending:
            bot.send_message(call.message.chat.id, "✅ Нет ожидающих верификации")
            return
        
        bot.send_message(
            call.message.chat.id,
            f"⏳ *На верификации: {len(pending)} человек*",
            parse_mode="Markdown"
        )
        
        for user in pending:
            send_verification_request(call.message.chat.id, user)
    
    # 6.5. Админ - модерация вакансий
    elif call.data == "admin_jobs":
        if call.from_user.id != ADMIN_ID:
            bot.answer_callback_query(call.id, "⛔ Доступ запрещен")
            return
        
        bot.answer_callback_query(call.id, "Загружаю...")
        pending = get_pending_jobs()
        
        if not pending:
            bot.send_message(call.message.chat.id, "✅ Нет вакансий на модерации")
            return
        
        bot.send_message(
            call.message.chat.id,
            f"📋 *Вакансий на модерации: {len(pending)}*",
            parse_mode="Markdown"
        )
        
        for job in pending:
            send_job_moderation_request(call.message.chat.id, job)
    
    # 7. Админ - статистика
    elif call.data == "admin_stats":
        if call.from_user.id != ADMIN_ID:
            bot.answer_callback_query(call.id, "⛔ Доступ запрещен")
            return
        
        show_stats(call.message)
    
    # 8. Верификация (approve/reject)
    elif call.data.startswith(('approve_user_', 'reject_user_')):
        if call.from_user.id != ADMIN_ID:
            bot.answer_callback_query(call.id, "⛔ Доступ запрещен")
            return
        
        parts = call.data.split('_')
        action = parts[0]
        uid = '_'.join(parts[2:])
        status = 'yes' if action == 'approve' else 'no'
        
        if update_user_verification(uid, status):
            verdict = "✅ ОДОБРЕНО" if action == 'approve' else "❌ ОТКЛОНЕНО"
            bot.answer_callback_query(call.id, f"{verdict}")
            
            current_caption = call.message.caption or ""
            bot.edit_message_caption(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                caption=f"{current_caption}\n\n*СТАТУС: {verdict}*",
                parse_mode="Markdown",
                reply_markup=None
            )
        else:
            bot.answer_callback_query(call.id, "❌ Ошибка обновления")
    
    # 9. Модерация вакансий (approve/reject)
    elif call.data.startswith(('approve_job_', 'reject_job_')):
        if call.from_user.id != ADMIN_ID:
            bot.answer_callback_query(call.id, "⛔ Доступ запрещен")
            return
        
        parts = call.data.split('_')
        action = parts[0]
        job_id = '_'.join(parts[2:])
        
        if action == 'approve':
            if approve_job(job_id):
                bot.answer_callback_query(call.id, "✅ Вакансия одобрена и опубликована!")
                verdict = "✅ ОДОБРЕНО И ОПУБЛИКОВАНО"
            else:
                bot.answer_callback_query(call.id, "❌ Ошибка одобрения")
                return
        else:
            if reject_job(job_id, 'Отклонено администратором'):
                bot.answer_callback_query(call.id, "❌ Вакансия отклонена")
                verdict = "❌ ОТКЛОНЕНО"
            else:
                bot.answer_callback_query(call.id, "❌ Ошибка отклонения")
                return
        
        try:
            current_text = call.message.text or ""
            bot.edit_message_text(
                chat_id=call.message.chat.id,
                message_id=call.message.message_id,
                text=f"{current_text}\n\n*СТАТУС: {verdict}*",
                parse_mode="Markdown",
                reply_markup=None
            )
        except:
            pass


# --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
def send_job_card(chat_id, job):
    """Отправить красивую карточку вакансии"""
    markup = types.InlineKeyboardMarkup()
    markup.add(
        types.InlineKeyboardButton("📱 Написать в WhatsApp", url=f"https://wa.me/{job.get('phone', '77001234567')}")
    )
    
    job_text = (
        f"💼 *{job.get('title', 'Вакансия')}*\n\n"
        f"💰 *Зарплата:* {job.get('price', 'Не указана')}\n"
        f"👶 *Возраст:* {job.get('age', '14+')}\n"
        f"📍 *Город:* Уральск\n\n"
        f"📝 *Описание:*\n{job.get('desc', 'Описание отсутствует')}\n\n"
        f"⏰ Откликнись быстрее — места ограничены!"
    )
    
    bot.send_message(chat_id, job_text, reply_markup=markup, parse_mode="Markdown")


def send_verification_request(chat_id, user):
    """Отправить запрос на верификацию админу"""
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("✅ Одобрить", callback_data=f"approve_user_{user['uid']}"),
        types.InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_user_{user['uid']}")
    )
    
    caption = (
        f"👤 *Запрос на верификацию*\n\n"
        f"*Имя:* {user.get('name', 'Не указано')}\n"
        f"*Email:* {user.get('email', 'Не указан')}\n"
        f"*Тип:* {user.get('type', 'teen')}\n"
        f"*UID:* `{user['uid']}`"
    )
    
    # Если есть фото документа
    if user.get('docUrl'):
        try:
            bot.send_photo(
                chat_id,
                user['docUrl'],
                caption=caption,
                reply_markup=markup,
                parse_mode="Markdown"
            )
        except:
            bot.send_message(
                chat_id,
                caption + f"\n\n📄 [Документ]({user['docUrl']})",
                reply_markup=markup,
                parse_mode="Markdown"
            )
    else:
        bot.send_message(chat_id, caption, reply_markup=markup, parse_mode="Markdown")


def send_job_moderation_request(chat_id, job):
    """Отправить вакансию на модерацию админу"""
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("✅ Одобрить", callback_data=f"approve_job_{job['id']}"),
        types.InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_job_{job['id']}")
    )
    
    salary_text = "По договорённости"
    if job.get('salaryFrom') and job.get('salaryTo'):
        salary_text = f"{job['salaryFrom']:,}₸ - {job['salaryTo']:,}₸"
    
    job_text = (
        f"💼 *НОВАЯ ВАКАНСИЯ НА МОДЕРАЦИИ*\n\n"
        f"*Название:* {job.get('title', 'Не указано')}\n"
        f"*Компания:* {job.get('companyName', 'Не указана')}\n"
        f"*Город:* {job.get('city', 'Не указан')}\n\n"
        f"💰 *Зарплата:* {salary_text}\n"
        f"👶 *Возраст:* {job.get('minAge', 14)}+ лет\n"
        f"📅 *График:* {job.get('schedule', 'Не указан')}\n"
        f"⏰ *Занятость:* {job.get('employmentType', 'Не указана')}\n\n"
        f"*О компании:*\n{job.get('companyDescription', 'Не указано')[:200]}...\n\n"
        f"*Обязанности:*\n{job.get('responsibilities', 'Не указаны')[:200]}...\n\n"
        f"*Контакты:*\n"
        f"Имя: {job.get('contactName', 'Не указано')}\n"
        f"Телефон: {job.get('contactPhone', 'Не указан')}\n"
        f"\n📝 *ID вакансии:* `{job['id']}`"
    )
    
    bot.send_message(chat_id, job_text, reply_markup=markup, parse_mode="Markdown")


# --- АВТОМАТИЧЕСКИЕ УВЕДОМЛЕНИЯ ---
def check_new_jobs():
    """Проверка новых вакансий каждые 60 секунд"""
    global last_job_count
    
    while True:
        try:
            jobs = get_active_jobs()
            current_count = len(jobs)
            
            # Если появились новые вакансии
            if current_count > last_job_count and last_job_count > 0:
                new_jobs_count = current_count - last_job_count
                
                # Отправляем уведомление всем подписчикам
                for user_id in list(subscribers):
                    try:
                        bot.send_message(
                            user_id,
                            f"🔥 *НОВЫЕ ВАКАНСИИ!*\n\n"
                            f"Появилось {new_jobs_count} новых предложений!\n"
                            f"Успей откликнуться первым 🚀",
                            parse_mode="Markdown"
                        )
                        
                        # Отправляем последние новые вакансии
                        for job in jobs[-new_jobs_count:]:
                            send_job_card(user_id, job)
                            time.sleep(0.5)  # Задержка между сообщениями
                        
                    except Exception as e:
                        print(f"Ошибка отправки уведомления {user_id}: {e}")
                        subscribers.discard(user_id)  # Удаляем если заблокировал бота
            
            last_job_count = current_count
            
        except Exception as e:
            print(f"Ошибка проверки вакансий: {e}")
        
        time.sleep(60)  # Проверяем каждую минуту


# --- ЗАПУСК БОТА ---
if __name__ == "__main__":
    print("=" * 50)
    print("🦄 TeenX Hub Bot запущен!")
    print(f"📊 Firebase: {'✅ Подключен' if db else '❌ Отключен'}")
    print(f"👤 Админ ID: {ADMIN_ID}")
    print("=" * 50)
    
    # Запускаем фоновый поток для проверки новых вакансий
    notification_thread = threading.Thread(target=check_new_jobs, daemon=True)
    notification_thread.start()
    print("🔔 Система уведомлений запущена")
    
    # Запускаем бота
    print("⏳ Ожидаю сообщения...\n")
    bot.infinity_polling()
