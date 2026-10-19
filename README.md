# PromptCard

> Your AI prompt card library — shareable, versioned, reusable.
>
> 你的 AI 提示词卡片库 — 可分享、可版本化、可复用。

Turn scattered prompts into beautiful, shareable, versioned cards. Available in **English** and **中文**.

把散落在聊天记录、备忘录、收藏夹里的提示词，变成一张张精美卡片。支持**中英文双语**切换。

## Why PromptCard

Every heavy AI user has this problem: good prompts get scattered across chat logs, notes, bookmarks. When you need them, you can't find them. When you tweak them, you don't know which version was best. PromptCard fixes this:

- **One-click save** — store prompts as cards, tag them, full-text search
- **Version tracking** — every edit keeps history, nothing lost
- **Share as image** — export a beautiful card image to share on social
- **Import / Export** — JSON batch migration, your data is yours

## Quick Start

### Option 1: Zero-install (recommended for trying)

Double-click `index.html` to open in your browser. Data is stored in IndexedDB, fully local.

Or start a local server:

```bash
python3 -m http.server 3000
```

Open http://localhost:3000. Six example cards are auto-seeded on first launch.

### Option 2: Next.js version

```bash
npm install
npm run seed    # seed example cards
npm run dev
```

Open http://localhost:3000. Data stored in `data/promptcard.sqlite`.

## Language

The app auto-detects your browser language (Chinese or English). Click the **EN / 中** button in the top bar to switch manually. Your choice is saved to `localStorage`.

## Features

| Feature | Status |
|---|---|
| Card CRUD | ✅ MVP |
| Tags + filtering | ✅ MVP |
| Full-text search | ✅ MVP |
| JSON import / export | ✅ MVP |
| Share card as image | ✅ MVP |
| Version history | ✅ built-in |
| Bilingual (EN / 中文) | ✅ MVP |
| Multi-model comparison | 🔜 V2 |
| Community card library | 🔜 V3 |
| Optional cloud sync | 🔜 V3 |

## Tech Stack

**Current MVP (zero-install):**
- HTML + Tailwind CSS (CDN)
- IndexedDB (browser-native database)
- html-to-image (card image export)
- lucide icons

**Engineering version (src/):**
- Next.js 14 (App Router) + TypeScript
- SQLite (better-sqlite3)
- Tailwind CSS + lucide-react

## Project Structure

```
promptcard/
├── index.html              # zero-install version (open and use)
├── seed.js                 # seed data script
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── .env.example
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── src/                    # Next.js engineering version
    ├── app/
    │   ├── api/
    │   │   ├── cards/route.ts
    │   │   ├── cards/[id]/route.ts
    │   │   ├── tags/route.ts
    │   │   └── import-export/route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    └── lib/
        ├── db.ts
        └── utils.ts
```

## Roadmap

### MVP (current)
- [x] Card CRUD
- [x] Tags + search
- [x] Import / export
- [x] Share card image
- [x] Version history
- [x] Bilingual (EN / 中文)

### V2 (next)
- [ ] Version tree visualization (diff)
- [ ] Multi-model comparison (run same prompt on GPT / Claude / DeepSeek)
- [ ] Card template library

### V3 (long-term)
- [ ] Community card library
- [ ] Optional cloud sync
- [ ] Browser extension (one-click save prompt from current chat)

## Tips for GitHub Stars

1. Record a GIF demo with [LICEcap](https://www.cockos.com/licecap/) and put it at the top of README
2. Post to Reddit (r/ChatGPT, r/OpenAI), Hacker News, Product Hunt, 即刻, V2EX, 掘金
3. Title: "I turned scattered AI prompts into a card library — open source"
4. Use a beautiful share-card image as the cover
5. Respond to issues quickly, merge reasonable PRs

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
