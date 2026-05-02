export interface BlogArticle {
  slug: string;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  contentRu: string;
  contentEn: string;
  date: string;
  readTimeMin: number;
  tags: string[];
}

export const ARTICLES: BlogArticle[] = [
  {
    slug: 'solve-tasks-from-photo',
    titleRu: 'Как решить задачу по фото с ИИ',
    titleEn: 'How to solve tasks from a photo with AI',
    descriptionRu: 'Пошаговая инструкция: фотографируете задачу, отправляете в Claude Opus и получаете подробное решение.',
    descriptionEn: 'Step-by-step guide: take a photo of a problem, send it to Claude Opus and get a detailed solution.',
    date: '2025-12-15',
    readTimeMin: 5,
    tags: ['vision', 'education'],
    contentRu: `## Зачем это нужно?

Многие студенты тратят часы на поиск решений задач из учебников. С Vibeneura вы можете просто сфотографировать задачу и получить пошаговое решение за секунды.

## Какую модель выбрать?

Для анализа изображений нужна модель с поддержкой **зрения (vision)**:

- **Claude Opus 4.7** — лучший выбор для сложных задач. Глубокий анализ, понимание контекста.
- **Claude Sonnet 4.6** — хороший баланс скорости и качества.
- **Claude Haiku 4.5** — бесплатный, но тоже поддерживает фото.

## Пошаговая инструкция

### 1. Сфотографируйте задачу
Убедитесь, что текст чётко виден. Хорошее освещение — залог точного распознавания.

### 2. Откройте Vibeneura
Перейдите в чат и выберите модель с поддержкой зрения (отмечена бейджем «зрение»).

### 3. Отправьте фото
Нажмите иконку камеры 📷 или прикрепите файл через 📎. Добавьте текст: «Реши эту задачу пошагово».

### 4. Получите решение
ИИ извлечёт текст с фото, определит тип задачи и решит её с подробным объяснением каждого шага.

## Советы

- 📐 Для математики добавьте: «Покажи каждый шаг вычислений»
- 🧪 Для химии: «Уравняй реакцию и объясни»
- 📝 Для конспектов: «Извлеки весь текст и структурируй»

## Заключение

Vibeneura превращает телефон в персонального репетитора. Попробуйте — первые 10 000 токенов бесплатно!`,
    contentEn: `## Why do you need this?

Many students spend hours searching for solutions to textbook problems. With Vibeneura, you can simply take a photo of a problem and get a step-by-step solution in seconds.

## Which model to choose?

To analyse images you need a model with **vision** support:

- **Claude Opus 4.7** — best for complex tasks. Deep analysis, context understanding.
- **Claude Sonnet 4.6** — good balance of speed and quality.
- **Claude Haiku 4.5** — free, but also supports photos.

## Step-by-step guide

### 1. Take a photo of the problem
Make sure the text is clearly visible. Good lighting ensures accurate recognition.

### 2. Open Vibeneura
Go to the chat and select a model with vision support (marked with a "vision" badge).

### 3. Send the photo
Tap the camera icon 📷 or attach a file via 📎. Add text: "Solve this problem step by step."

### 4. Get the solution
The AI will extract text from the photo, identify the problem type and solve it with a detailed explanation.

## Tips

- 📐 For maths add: "Show every calculation step"
- 🧪 For chemistry: "Balance the reaction and explain"
- 📝 For notes: "Extract all text and structure it"

## Conclusion

Vibeneura turns your phone into a personal tutor. Try it — first 10,000 tokens are free!`,
  },
  {
    slug: 'gpt-vs-claude-comparison',
    titleRu: 'GPT vs Claude — сравнение моделей в 2026',
    titleEn: 'GPT vs Claude — Model comparison in 2026',
    descriptionRu: 'Разбираем плюсы и минусы GPT 5.5 и Claude Opus 4.7. Какая модель лучше для ваших задач?',
    descriptionEn: 'We break down the pros and cons of GPT 5.5 and Claude Opus 4.7. Which model is better for your tasks?',
    date: '2026-01-20',
    readTimeMin: 7,
    tags: ['models', 'comparison'],
    contentRu: `## Введение

В 2026 году на рынке ИИ доминируют два гиганта: **GPT 5.5** от OpenAI и **Claude Opus 4.7** от Anthropic. Оба доступны в Vibeneura без VPN — давайте сравним.

## GPT 5.5

### Плюсы
- 🚀 Мультимодальность: текст, изображения, код, аудио
- 🌍 Широкая база знаний
- ⚡ Быстрое время ответа
- 🔧 Отличная работа с кодом и API

### Минусы
- Иногда «выдумывает» факты (галлюцинации)
- Склонен к шаблонным ответам

## Claude Opus 4.7

### Плюсы
- 🧠 Глубокое рассуждение и анализ
- 📚 Огромный контекст (200K+ токенов)
- 🎯 Меньше галлюцинаций
- ✍️ Более естественный стиль текста

### Минусы
- Чуть медленнее GPT
- Менее известен среди пользователей

## Когда что использовать?

| Задача | Лучший выбор |
|--------|-------------|
| Код и программирование | GPT 5.5 |
| Длинные тексты и анализ | Claude Opus 4.7 |
| Решение задач по фото | Claude Opus 4.7 |
| Быстрые ответы | Claude Sonnet 4.6 |
| Бесплатные запросы | Claude Haiku 4.5 |

## Вывод

Нет однозначного победителя — каждая модель сильна в своём. В Vibeneura вы можете переключаться между ними в один клик и выбирать лучшую для каждой задачи.`,
    contentEn: `## Introduction

In 2026, the AI market is dominated by two giants: **GPT 5.5** from OpenAI and **Claude Opus 4.7** from Anthropic. Both are available in Vibeneura without a VPN — let's compare them.

## GPT 5.5

### Pros
- 🚀 Multimodal: text, images, code, audio
- 🌍 Wide knowledge base
- ⚡ Fast response time
- 🔧 Excellent code and API handling

### Cons
- Sometimes "invents" facts (hallucinations)
- Tends towards formulaic responses

## Claude Opus 4.7

### Pros
- 🧠 Deep reasoning and analysis
- 📚 Huge context window (200K+ tokens)
- 🎯 Fewer hallucinations
- ✍️ More natural writing style

### Cons
- Slightly slower than GPT
- Less well-known among users

## When to use what?

| Task | Best choice |
|------|------------|
| Code & programming | GPT 5.5 |
| Long texts & analysis | Claude Opus 4.7 |
| Solving tasks from photos | Claude Opus 4.7 |
| Quick answers | Claude Sonnet 4.6 |
| Free requests | Claude Haiku 4.5 |

## Conclusion

There is no clear winner — each model excels at different things. In Vibeneura you can switch between them in one click.`,
  },
  {
    slug: 'vibeneura-no-vpn',
    titleRu: 'Vibeneura: все ИИ-модели без VPN',
    titleEn: 'Vibeneura: all AI models without a VPN',
    descriptionRu: 'Как получить доступ к ChatGPT и Claude из России без VPN. Обзор сервиса Vibeneura.',
    descriptionEn: 'How to access ChatGPT and Claude from Russia without a VPN. An overview of Vibeneura.',
    date: '2026-03-10',
    readTimeMin: 4,
    tags: ['overview', 'vpn'],
    contentRu: `## Проблема

С 2023 года доступ к ChatGPT и Claude из России заблокирован. Миллионы пользователей вынуждены использовать VPN, что создаёт неудобства:

- 🐢 Медленная скорость
- 💸 Платные VPN-сервисы
- 🔒 Риски безопасности
- 📱 Сложная настройка на мобильных

## Решение: Vibeneura

Vibeneura — это ИИ-агрегатор, который проксирует все запросы через свои серверы. Это значит:

- ✅ **Без VPN** — просто откройте сайт
- ✅ **Все модели** — GPT 5.5, Claude Opus 4.7, Sonnet 4.6, Haiku 4.5
- ✅ **Одна подписка** — вместо нескольких
- ✅ **Из любого браузера** — ПК и мобильные

## Как это работает?

1. Вы вводите запрос в Vibeneura
2. Наш сервер отправляет его нужной ИИ-модели
3. Ответ приходит вам через наш защищённый канал

Весь процесс занимает считанные секунды и полностью прозрачен для пользователя.

## Безопасность

- 🔐 Все данные шифруются (TLS 1.3)
- 🗑️ Мы не храним запросы на серверах провайдеров
- 🔑 Доступ к чатам только через вашу учётную запись

## Начните бесплатно

Зарегистрируйтесь и получите 10 000 стартовых токенов. Этого хватит на ~50 запросов к бесплатной модели Claude Haiku 4.5.`,
    contentEn: `## The Problem

Since 2023, access to ChatGPT and Claude from Russia has been blocked. Millions of users are forced to use VPNs, which creates inconveniences:

- 🐢 Slow speed
- 💸 Paid VPN services
- 🔒 Security risks
- 📱 Complex mobile setup

## The Solution: Vibeneura

Vibeneura is an AI aggregator that proxies all requests through its servers. This means:

- ✅ **No VPN** — just open the website
- ✅ **All models** — GPT 5.5, Claude Opus 4.7, Sonnet 4.6, Haiku 4.5
- ✅ **One subscription** — instead of several
- ✅ **From any browser** — desktop and mobile

## How it works

1. You enter a query in Vibeneura
2. Our server sends it to the appropriate AI model
3. The response comes back through our secure channel

The entire process takes seconds and is completely transparent to the user.

## Security

- 🔐 All data encrypted (TLS 1.3)
- 🗑️ We don't store queries on provider servers
- 🔑 Chat access only through your account

## Start for free

Sign up and get 10,000 starter tokens. That's enough for ~50 requests to the free Claude Haiku 4.5 model.`,
  },
];

export function getArticle(slug: string): BlogArticle | undefined {
  return ARTICLES.find(a => a.slug === slug);
}
