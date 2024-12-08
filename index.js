import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient();
export const bot_tg = new TelegramBot(process.env.API_KEY_BOT, {
  polling: {
    interval: 200,
    autoStart: true,
  },
});

async function main() {
  bot_tg.on("polling_error", (err) => console.log(err.data.error.message));
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);

  bot_tg.on("message", async (msg) => {
    if (msg.text === "/start") {
      const admins = await prisma.users.findMany({
        where: { role: "admin" },
        select: { tgId: true },
      });

      let isAdmin = false;
      for (let obj of admins) {
        if (String(msg.from.id) === obj.tgId) {
          isAdmin = true;
          await bot_tg.sendMessage(
            msg.chat.id,
            "Функционала для админов не завезли. \n\n\n*_ДЕНЕГ НЕТ_*\n\np.s Во всем виноват паша"
          );
          break;
        }
      }

      if (!isAdmin) {
        try {
          await prisma.users.create({
            data: {
              name: msg.from.last_name
                ? `${msg.from.first_name} ${msg.from.last_name}`
                : msg.from.first_name,
              username: msg.from.username,
              tgId: String(msg.from.id),
              project: process.env.NAME_PROJECT,
            },
          });
          try {
            await bot_tg.forwardMessage(
              process.env.ID_CHAT,
              msg.chat.id,
              msg.message_id
            );
          } catch (error) {
            console.log(error);
          }
        } catch (error) {
          console.log(error);
        }
        await bot_tg.sendAnimation(msg.chat.id, "./public/gif.gif.mp4", {
          caption:
            "*Теперь Telegram золотая жила*\n\nКанал не растёт? Или только планируете запуск?\n\nTelegram приносит клиентов и доход, если всё настроить правильно\\.\n\n*Что мешает успеху?*\n\n→ Не знаете, с чего начать\\.\n→ Канал стоит на месте\\.\n→ Нет времени или опыта для самостоятельной работы\\.\n\n*Как мы помогаем?*\n\n→ Запускаем канал с нуля\\.\n→ Обновляем и оживляем существующий: ребрендинг, аудит, контент\\.\n→ Настраиваем автоматизацию: боты, сервисы, мини\\-приложения\\.\n→ Консультируем и создаём стратегию 'под ключ'\\.\n→ Подбираем каналы для рекламы без переплат\\.\n\n*Почему это работает?*\n\n• Понятный план\\.\n• Прозрачная работа с отчётами\\.\n• Оплата только за конкретный этап\\.\n\nTelegram \— это возможности\\. Начните с бесплатной консультации, чтобы узнать, как запустить или оживить канал\\.\n\n*👉 Мы здесь, чтобы ваш Telegram работал на вас ↓↓↓*",
          parse_mode: "MarkdownV2",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "БЕСПЛАТНАЯ КОНСУЛЬТАЦИЯ",
                  url: "https://t.me/m/J3Op0-A7MGJi",
                },
              ],
              [{ text: "КАНАЛ", url: "https://t.me/targetdysh" }],
            ],
          },
        });

        // await bot_tg.sendVideo(msg.chat.id, "./public/gif.mp4", {
        //   width: 1920,
        //   height: 1080,
        // });
        // await bot_tg.sendPhoto(msg.chat.id, "./public/message.jpg", {
        //   caption:
        //     "*Почему ты так мало продаешь?* \n\nПочти из каждого угла я слышу, как сотни селлеров сливают свои товары *за бесценок*, просто потому, что они *не знают как правильно преподносить свой продукт\\.*\n\nА ведь ключ к решению такой проблемы прост — ||внешняя рекламa\\.||\n\n*Ты только задумайся: всего один рилс, может принести тысячи продаж, хотя его стоимость будет не больше 3 000 рублей\\. А что с твоей прибылью? Посчитай сам\\.*\n\nКак бы прекрасно не был настроен твой рекламный кабинет или подобрана инфографика, все это нечто, по сравнению с возможностями *настоящей социальной рекламы\\.*\n\nЯ являюсь специалистом в этой сфере и знаю о *всё* внешней рекламе маркетплейсов\\. Недавно я начал давать *бесплатные [личные консультации](https://clck.ru/3BX2nJ)*, которые уже принесли своим владельцам миллионы прибыли\\.",
        //   parse_mode: "MarkdownV2",
        //   reply_markup: {
        //     inline_keyboard: [
        //       [{ text: "Написать", url: "https://t.me/RyslanNovikov" }],
        //       [{ text: "Канал", url: "https://t.me/marketPati" }],
        //       [{ text: "Отзывы", url: "https://t.me/OtzivRuslanNovikov" }],
        //     ],
        //   },
        // });
      }
    }
    // if (msg.text === "✉️ Установить новое сообщение") {
    //   const admins = await prisma.users.findMany({
    //     where: { role: "admin" },
    //     select: { tgId: true },
    //   });

    //   let isAdmin = false;
    //   for (let obj of admins) {
    //     if (String(msg.from.id) === obj.tgId) {
    //       isAdmin = true;
    //       break;
    //     }
    //   }
    //   if (isAdmin) {
    //     await bot_tg.sendMessage(msg.chat.id, "Перешлите новое сообщение");
    //     bot_tg.on("text", async (msg) => {
    //       console.log(msg);
    //       await bot_tg.sendMessage(msg.chat.id, msg.text, {
    //         entities: msg.entities,
    //       });
    //     });
    //   }
    // }
  });
}

await main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
