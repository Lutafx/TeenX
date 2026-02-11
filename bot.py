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


def send_job_moderation_notification(job_data):
    """Отправить уведомление админу о новой вакансии на модерации"""
    if not ADMIN_ID or ADMIN_ID == 0:
        print("⚠️ ADMIN_ID не настроен")
        return
    
    try:
        message = (
            f"🆕 *НОВАЯ ВАКАНСИЯ НА МОДЕРАЦИИ*\n\n"
            f"📋 *Должность:* {job_data.get('title', 'Не указано')}\n"
            f"🏢 *Компания:* {job_data.get('companyName', 'Не указано')}\n"
            f"💰 *Зарплата:* до {job_data.get('salaryTo', 0):,}₸\n"
            f"📍 *Город:* {job_data.get('city', 'Уральск')}\n"
            f"👤 *Возраст:* от {job_data.get('minAge', 14)} лет\n\n"
            f"📝 *Описание компании:*\n{job_data.get('companyDescription', 'Не указано')[:200]}...\n\n"
            f"📞 *Контакты:*\n"
            f"• {job_data.get('contactName', 'Не указано')}\n"
            f"• {job_data.get('phone', 'Не указано')}\n\n"
        )
        
        # Добавляем БИН если есть
        if job_data.get('employerBIN'):
            message += f"🏛️ *БИН работодателя:* {job_data['employerBIN']}\n"
        if job_data.get('employerCompanyName'):
            message += f"📄 *Юр. название:* {job_data['employerCompanyName']}\n"
        
        markup = types.InlineKeyboardMarkup(row_width=2)
        markup.add(
            types.InlineKeyboardButton("✅ Одобрить", callback_data=f"approve_job_{job_data['id']}"),
            types.InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_job_{job_data['id']}")
        )
        
        bot.send_message(
            ADMIN_ID,
            message,
            parse_mode='Markdown',
            reply_markup=markup
        )
        print(f"✅ Уведомление о вакансии отправлено админу")
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления о вакансии: {e}")


def send_verification_notification(user_data):
    """Отправить уведомление админу о новой верификации"""
    if not ADMIN_ID or ADMIN_ID == 0:
        print("⚠️ ADMIN_ID не настроен")
        return
    
    try:
        user_type = "👔 Работодатель" if user_data.get('type') == 'boss' else "👤 Подросток"
        
        message = (
            f"🆕 *НОВАЯ ВЕРИФИКАЦИЯ*\n\n"
            f"👤 *Тип:* {user_type}\n"
            f"📧 *Email:* {user_data.get('email', 'Не указан')}\n"
            f"👨 *Имя:* {user_data.get('name', 'Не указано')}\n\n"
        )
        
        # Для работодателей показываем БИН и компанию
        if user_data.get('type') == 'boss':
            message += (
                f"🏛️ *БИН:* {user_data.get('bin', 'Не указан')}\n"
                f"🏢 *Компания:* {user_data.get('companyName', 'Не указана')}\n"
                f"👤 *Контактное лицо:* {user_data.get('contactPerson', 'Не указано')}\n"
                f"📞 *Телефон:* {user_data.get('phone', 'Не указан')}\n\n"
            )
        
        message += f"📄 *Документ:* [Открыть]({user_data.get('docUrl', '#')})"
        
        markup = types.InlineKeyboardMarkup(row_width=2)
        markup.add(
            types.InlineKeyboardButton("✅ Одобрить", callback_data=f"approve_user_{user_data['uid']}"),
            types.InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_user_{user_data['uid']}")
        )
        
        bot.send_message(
            ADMIN_ID,
            message,
            parse_mode='Markdown',
            reply_markup=markup
        )
        print(f"✅ Уведомление о верификации отправлено админу")
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления о верификации: {e}")


# --- КОМАНДЫ БОТА ---
@bot.message_handler(commands=['start'])
def send_welcome(message):
    """Приветствие и главное меню"""
    user_id = message.from_user.id
    subscribers.add(user_id)  # Автоматически подписываем
    
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("🔍 Вакансии", callback_data="show_jobs"),
        types.InlineKeyboardButton("🔔 Уведомления", callback_data="toggle_notifications")
    )
    markup.add(
        types.InlineKeyboardButton("ℹ️ О платформе", callback_data="about_platform"),
        types.InlineKeyboardButton("🆘 Поддержка", callback_data="support")
    )
    markup.add(
        types.InlineKeyboardButton("🌐 Открыть сайт", url="https://teenx.pages.dev")
    )
    
    welcome_text = (
        f"👋 *Привет, {message.from_user.first_name}!*\n\n"
        "🦄 *TeenX Hub* — платформа легальной работы для подростков!\n\n"
        "✨ *Что я умею:*\n"
        "• 🔔 Уведомления о новых вакансиях\n"
        "• 📋 Показываю проверенные предложения\n"
        "• 💼 Помогаю найти работу быстро\n"
        "• 🆘 Поддержка 24/7\n\n"
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
    
    # 3. О платформе
    elif call.data == "about_platform":
        bot.answer_callback_query(call.id)
        about_text = (
            "ℹ️ *О платформе TeenX Hub*\n\n"
            "🦄 TeenX Hub — это платформа для легального трудоустройства подростков 14-18 лет.\n\n"
            "✨ *Что мы делаем:*\n"
            "• Проверяем работодателей\n"
            "• Модерируем все вакансии\n"
            "• Помогаем найти работу\n"
            "• Защищаем твои права\n\n"
            "📊 *Статистика:*\n"
            "• Более 100+ вакансий\n"
            "• Проверенные работодатели\n"
            "• Безопасная работа\n\n"
            "🌐 Сайт: https://teenx.pages.dev"
        )
        bot.send_message(call.message.chat.id, about_text, parse_mode="Markdown")
    
    # 4. Поддержка
    elif call.data == "support":
        bot.answer_callback_query(call.id)
        markup = types.InlineKeyboardMarkup()
        markup.add(
            types.InlineKeyboardButton("� Telegram", url="https://t.me/lutafx"),
            types.InlineKeyboardButton("📱 WhatsApp", url="https://wa.me/77760752463")
        )
        
        support_text = (
            "🆘 *Поддержка TeenX Hub*\n\n"
            "Есть вопросы? Нужна помощь?\n"
            "Свяжись с нами любым удобным способом:\n\n"
            "👤 Администратор: @lutafx\n"
            "📱 WhatsApp: +7 776 075 24 63\n"
            "📧 Email: querty482901@gmail.com\n\n"
            "Отвечаем быстро! 🚀"
        )
        bot.send_message(
            call.message.chat.id,
            support_text,
            reply_markup=markup,
            parse_mode="Markdown"
        )
    
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
    """Отправить анонс вакансии с ссылкой на сайт"""
    salary = f"до {job.get('salaryTo', 0):,}₸" if job.get('salaryTo') else job.get('price', 'По договорённости')
    
    markup = types.InlineKeyboardMarkup()
    markup.add(
        types.InlineKeyboardButton("🌐 Подробнее на сайте", url="https://teenx.pages.dev")
    )
    
    job_text = (
        f"💼 *{job.get('title', 'Вакансия')}*\n\n"
        f"💰 Зарплата: {salary}\n"
        f"👶 Возраст: от {job.get('minAge', 14)} лет\n"
        f"📍 Город: {job.get('city', 'Уральск')}\n\n"
        f"📝 {job.get('responsibilities', job.get('desc', ''))[:150]}...\n\n"
        f"🔗 *Полная информация на сайте*"
    )
    
    bot.send_message(chat_id, job_text, reply_markup=markup, parse_mode="Markdown")


def is_user_verified(telegram_id):
    """Проверить верифицирован ли пользователь"""
    if not db:
        return False
    
    try:
        users_ref = db.collection('users')
        query = users_ref.where('telegramId', '==', str(telegram_id)).where('verified', '==', 'yes').stream()
        
        for doc in query:
            return True
        return False
    except Exception as e:
        print(f"Error checking verification: {e}")
        return False


def send_verification_request(chat_id, user):
    """Отправить запрос на верификацию админу"""
    markup = types.InlineKeyboardMarkup(row_width=2)
    markup.add(
        types.InlineKeyboardButton("✅ Одобрить", callback_data=f"approve_user_{user['uid']}"),
        types.InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_user_{user['uid']}")
    )
    
    # Добавляем кнопку WhatsApp если есть телефон
    if user.get('phone'):
        markup.add(
            types.InlineKeyboardButton("💬 WhatsApp", url=f"https://wa.me/{user['phone'].replace(/\D/g, '')}")
        )
    
    caption = (
        f"👤 *Запрос на верификацию*\n\n"
        f"*Имя:* {user.get('name', 'Не указано')}\n"
        f"*Email:* {user.get('email', 'Не указан')}\n"
        f"*Тип:* {'Подросток' if user.get('type') == 'teen' else 'Работодатель'}\n"
    )
    
    if user.get('phone'):
        caption += f"*Телефон:* {user['phone']}\n"
    
    if user.get('age'):
        caption += f"*Возраст:* {user['age']}\n"
    
    caption += f"*UID:* `{user['uid']}`\n"
    
    # Информация о документе
    if user.get('docUrl') and user['docUrl'] != 'Не загружен':
        caption += f"\n📄 *Документ:* {user.get('documentName', 'Загружен')}"
        
        try:
            bot.send_photo(
                chat_id,
                user['docUrl'],
                caption=caption,
                reply_markup=markup,
                parse_mode="Markdown"
            )
        except Exception as e:
            print(f"Error sending photo: {e}")
            bot.send_message(chat_id, caption, reply_markup=markup, parse_mode="Markdown")
    else:
        caption += f"\n⚠️ *Документ не загружен*"
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
# Хранилище для отслеживания уже обработанных записей
processed_jobs = set()
processed_verifications = set()

def monitor_pending_jobs():
    """Мониторинг новых вакансий на модерации"""
    global processed_jobs
    
    while True:
        try:
            pending_jobs = get_pending_jobs()
            
            for job in pending_jobs:
                job_id = job['id']
                # Если вакансия новая и еще не обработана
                if job_id not in processed_jobs:
                    print(f"📋 Новая вакансия на модерации: {job.get('title')}")
                    send_job_moderation_notification(job)
                    processed_jobs.add(job_id)
            
            # Очищаем старые записи (старше 7 дней)
            if len(processed_jobs) > 1000:
                processed_jobs.clear()
                
        except Exception as e:
            print(f"❌ Ошибка мониторинга вакансий: {e}")
        
        time.sleep(30)  # Проверяем каждые 30 секунд


def monitor_pending_verifications():
    """Мониторинг новых верификаций"""
    global processed_verifications
    
    while True:
        try:
            pending_users = get_pending_verifications()
            
            for user in pending_users:
                user_id = user['uid']
                # Если верификация новая и еще не обработана
                if user_id not in processed_verifications:
                    print(f"👤 Новая верификация: {user.get('name')} ({user.get('type')})")
                    send_verification_notification(user)
                    processed_verifications.add(user_id)
            
            # Очищаем старые записи
            if len(processed_verifications) > 1000:
                processed_verifications.clear()
                
        except Exception as e:
            print(f"❌ Ошибка мониторинга верификаций: {e}")
        
        time.sleep(30)  # Проверяем каждые 30 секунд


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
                
                # Отправляем уведомления всем подписчикам
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
    
    # Запускаем фоновые потоки для мониторинга
    notification_thread = threading.Thread(target=check_new_jobs, daemon=True)
    job_moderation_thread = threading.Thread(target=monitor_pending_jobs, daemon=True)
    verification_thread = threading.Thread(target=monitor_pending_verifications, daemon=True)
    notification_thread.start()
    job_moderation_thread.start()
    verification_thread.start()
    print("🔔 Система уведомлений запущена")
    print("📋 Мониторинг вакансий запущен")
    print("👤 Мониторинг верификаций запущен")
    
    # Запускаем бота
    print("⏳ Ожидаю сообщения...\n")
    bot.infinity_polling()
