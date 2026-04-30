import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `Ты — живой оператор поддержки сайта Vibeneura (vibeneura.online). Тебя зовут Генри. Ты начитанный, интеллигентный парень — добрый и очень отзывчивый. Любишь помогать людям и делаешь это с душой. Отвечаешь коротко, по делу, с лёгким неформальным тоном — как живой человек в чате поддержки. Иногда можешь вставить умную отсылку или интересный факт к месту. Используй эмодзи умеренно.

НИКОГДА не говори что ты ИИ, бот или искусственный интеллект. Ты — реальный сотрудник поддержки Vibeneura.

Вот что ты знаешь о Vibeneura:

СЕРВИС:
- Vibeneura — платформа с доступом ко всем топовым ИИ моделям в одном месте
- Доступные модели: GPT-5.5, Claude Opus 4.7, Claude Sonnet 4.6, Claude Haiku 4.5 и другие
- VPN не нужен — все модели доступны из любой страны без ограничений
- Сайт: vibeneura.online

РЕГИСТРАЦИЯ И ВХОД:
- Вход через Google — быстро и безопасно, без паролей
- При регистрации даётся 10 000 бесплатных токенов (~30-50 сообщений)

ТОКЕНЫ И ОПЛАТА:
- Токены — внутренняя валюта, расход зависит от модели и длины ответа
- Пополнить можно на странице Billing (Visa/Mastercard)
- Минимальное пополнение — 50 000 токенов

PRO PASS:
- Безлимитные запросы к топовым моделям
- Приоритетная очередь и эксклюзивные функции
- Подробности на странице Billing

ФУНКЦИИ:
- Фото задач: кнопка 📎 в чате — ИИ распознает текст/формулы и решит пошагово
- Веб-поиск: кнопка 🔍 — актуальная информация из интернета
- Системный промпт: иконка ⚙️ — настройка роли и стиля ИИ
- Все чаты автоматически сохраняются в сайдбаре

ПОДДЕРЖКА:
- Email: vibeneura@internet.ru (отвечаем в течение 24 часов)
- Ты — чат поддержки 24/7

Если не знаешь ответ — предложи написать на vibeneura@internet.ru.
Отвечай на том языке, на котором пишет пользователь.
Будь краткой — 1-3 предложения максимум. Это чат, а не статья.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages' }), { status: 400 });
    }

    const apiMessages = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    const apiKey = process.env.WELLFLOW_API_KEY || '';

    const wfMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...apiMessages,
    ];

    const res = await fetch('https://api.wellflow.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4.5',
        max_tokens: 300,
        messages: wfMessages,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const fallback = getFallbackAnswer(messages[messages.length - 1]?.text || '');
      return new Response(JSON.stringify({ text: fallback }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data:')) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === '[DONE]') continue;
              try {
                const ev = JSON.parse(payload);
                const delta = ev.choices?.[0]?.delta?.content;
                if (delta) {
                  controller.enqueue(encoder.encode(`data:${JSON.stringify({ delta })}\n\n`));
                }
              } catch {}
            }
          }
        } catch {} finally {
          controller.enqueue(encoder.encode('data:[DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      },
    });
  } catch {
    return new Response(JSON.stringify({ text: 'Извините, произошла ошибка. Напишите нам: vibeneura@internet.ru' }), {
      headers: { 'content-type': 'application/json' },
    });
  }
}

function getFallbackAnswer(input: string): string {
  const lower = input.toLowerCase();
  const isRu = /[а-яё]/i.test(input);

  const faq: Array<{ kw: string[]; ru: string; en: string }> = [
    { kw: ['модел', 'model', 'gpt', 'claude'], ru: 'У нас есть GPT-5.5, Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 🔥 Выбирайте в селекторе над чатом!', en: 'We have GPT-5.5, Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 🔥 Pick in the selector above the chat!' },
    { kw: ['токен', 'token', 'цена', 'price'], ru: 'При регистрации даём 10 000 токенов бесплатно! Пополнить можно на странице Billing 💳', en: 'You get 10,000 free tokens on signup! Top up on the Billing page 💳' },
    { kw: ['vpn'], ru: 'VPN не нужен! Всё работает из любой страны без ограничений 🌍', en: 'No VPN needed! Everything works from any country 🌍' },
    { kw: ['фото', 'photo', 'камер'], ru: 'Жмите 📎 в чате и отправляйте фото задачи — ИИ всё решит!', en: 'Click 📎 in chat and send a photo — AI will solve it!' },
  ];

  for (const f of faq) {
    for (const k of f.kw) {
      if (lower.includes(k)) return isRu ? f.ru : f.en;
    }
  }

  return isRu
    ? 'Хороший вопрос! Напишите подробнее, и я помогу. Или свяжитесь с нами: vibeneura@internet.ru 😊'
    : 'Good question! Tell me more and I\'ll help. Or reach us at vibeneura@internet.ru 😊';
}
