import os
import telebot
from telebot import types

# Configuration
TOKEN = "8379880726:AAF8wIjUEWluEPBKLGe4j1iPl04wMW-bj18"
ADMIN_ID = 7682446178

bot = telebot.TeleBot(TOKEN)

# Data Mockup
vacancies = [
    {
        "title": "Бариста (Помощник)",
        "salary": "900 ₸/час",
        "desc": "Кофейня в центре. Гибкий график. Обучение на месте.",
        "link": "https://t.me/alikhan_ceo"
    },
    {
        "title": "SMM-ассистент",
        "salary": "50 000 ₸/проект",
        "desc": "Создание контента для Instagram/TikTok. iPhone предоставляется.",
        "link": "https://t.me/alikhan_ceo"
    },
    {
        "title": "Сортировщик (Парк)",
        "salary": "1200 ₸/час",
        "desc": "Работа на складе. Ежедневные выплаты. Уральск.",
        "link": "https://t.me/alikhan_ceo"
    }
]


@bot.message_handler(commands=['start'])
def send_welcome(message):
    # Quiet admin alert
    if ADMIN_ID:
        try:
            bot.send_message(ADMIN_ID, f"Activity: {message.from_user.first_name} (@{message.from_user.username})")
        except:
            pass

    markup = types.InlineKeyboardMarkup(row_width=1)
    markup.add(
        types.InlineKeyboardButton("🔍 Найти работу", callback_data="jobs"),
        types.InlineKeyboardButton("📄 Юр. защита (ТК РК)", callback_data="legal"),
        types.InlineKeyboardButton("👤 Профиль", callback_data="profile")
    )

    bot.send_message(
        message.chat.id,
        f"Привет, {message.from_user.first_name}!\n\n"
        "TeenX — сервис безопасного поиска работы для подростков (14-17 лет).\n\n"
        "• Проверенные вакансии\n"
        "• Юридическая поддержка",
        reply_markup=markup
    )


@bot.callback_query_handler(func=lambda call: True)
def handle_query(call):
    if call.data == "legal":
        bot.answer_callback_query(call.id)
        try:
            with open('doc.docx', 'rb') as f:
                bot.send_document(
                    call.message.chat.id,
                    f,
                    caption="✅ **Шаблон готов**\n\n"
                            "Распечатай и подпиши у родителей.\n"
                            "Данные вписываются вручную для обеспечения приватности.",
                    parse_mode="Markdown"
                )
        except:
            bot.send_message(call.message.chat.id, "Документ временно недоступен.")

    elif call.data == "jobs":
        bot.answer_callback_query(call.id)
        bot.send_message(call.message.chat.id, "🔍 **Доступные предложения:**", parse_mode="Markdown")

        for vac in vacancies:
            markup = types.InlineKeyboardMarkup()
            markup.add(types.InlineKeyboardButton("Откликнуться", url=vac['link']))

            content = f"📌 *{vac['title']}*\n💰 {vac['salary']}\n📝 {vac['desc']}"
            bot.send_message(call.message.chat.id, content, parse_mode="Markdown", reply_markup=markup)

    elif call.data == "profile":
        bot.answer_callback_query(call.id)
        status = (
            f"👤 **Профиль: {call.from_user.first_name}**\n\n"
            "Статус: 🟢 Активен\n"
            "Рейтинг: 5.0"
        )
        bot.send_message(call.message.chat.id, status, parse_mode="Markdown")


if __name__ == "__main__":
    bot.infinity_polling()