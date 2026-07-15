# Monthly Love 💌

A tiny, private letter site. Letters are written in [Notion](https://notion.so) and published to the web as password-protected pages — one password per letter, plus a site-wide password for the index of all letters. Built for sending monthly letters to someone special, but works for any small collection of private posts.

Visitors land on a minimal splash page, unlock the letters they have a password for, read them with a floating table of contents, and can leave comments (stored back into Notion as page comments). The whole site is `noindex, nofollow` so nothing leaks into search engines.

## How it works

- **Notion is the CMS.** Each letter is a page in a Notion database. Publishing a letter = checking its `Published` checkbox. Content is converted to Markdown server-side ([notion-to-md](https://github.com/souvikinator/notion-to-md)) and rendered with react-markdown (GFM tables, task lists, toggles, images, code blocks…).
- **Password gate is server-enforced.** A locked page renders *only* the password form — the article body is never fetched from Notion, so it never appears in the HTML or any HTTP response. Password checks run in Server Actions using `crypto.timingSafeEqual`.
- **Sessions via encrypted cookie.** Once a visitor unlocks a letter, its slug is stored in a signed + encrypted [iron-session](https://github.com/vvo/iron-session) cookie (30-day lifetime), so they don't re-enter the password on every visit.
- **Comments live in Notion.** Visitor comments are appended as native Notion comments on the letter's page (`"name\nmessage"`), so you read replies right inside Notion.
- **ISR, 60s.** Pages revalidate at most once per minute, which also keeps Notion-hosted image URLs (which expire after ~1 hour) fresh.
- **Bilingual UI (English / 中文).** All chrome — password forms, index, comments, navigation, error messages — is localized via dictionaries in `src/lib/i18n.ts`. English is the default; a floating button (top-right, rendered by the root layout) toggles the language, stored in a `ml_lang` cookie for a year. Letter *content* comes from Notion and is shown as written.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Splash page — a single link to /letters
│   ├── layout.tsx            # Root layout, fonts, global metadata
│   ├── globals.css           # Tailwind v4 theme, animations (sparkles, rise)
│   ├── not-found.tsx         # 404 page
│   ├── robots.ts             # Disallow all crawlers
│   ├── letters/
│   │   ├── page.tsx          # Password-gated index of all published letters
│   │   └── actions.ts        # Server Action: verify INDEX_PASSWORD
│   └── p/[slug]/
│       ├── page.tsx          # A single letter (password gate → article)
│       └── actions.ts        # Server Actions: verify letter password, post comment
├── components/
│   ├── PasswordForm.tsx      # Client form calling the bound unlock action
│   ├── Article.tsx           # Markdown → styled article, prev/next nav
│   ├── TableOfContents.tsx   # Floating TOC with scroll-spy (IntersectionObserver)
│   ├── CommentSection.tsx    # Comment list + submit form
│   ├── LangSwitch.tsx        # Floating EN/中文 toggle (writes the locale cookie)
│   └── Sparkles.tsx          # Decorative drifting hearts/stars (pure CSS, no JS)
└── lib/
    ├── notion.ts             # Notion client: query posts, page → Markdown, comments
    ├── auth.ts               # iron-session helpers (unlocked-slug list)
    ├── i18n.ts               # UI dictionaries (en/zh) — shared server & client
    ├── locale.ts             # Server-side locale-cookie reader (default: en)
    └── format.ts             # Date formatting
```

**Stack:** Next.js 16 (App Router, Server Components, Server Actions), React 19, Tailwind CSS v4, TypeScript, iron-session, @notionhq/client + notion-to-md.

## Setup

### 1. Create the Notion database

Create a database with these properties (names must match exactly):

| Property    | Type      | Purpose                                        |
| ----------- | --------- | ---------------------------------------------- |
| `Title`     | Title     | Letter title                                   |
| `Slug`      | Rich text | URL path — the letter lives at `/p/<slug>`     |
| `Password`  | Rich text | Password for this letter                       |
| `Published` | Checkbox  | Only checked letters are visible               |
| `Date`      | Date      | Shown on the letter and used to sort the index |
| `Excerpt`   | Rich text | Short teaser shown on the index page           |

Then create an integration at [notion.so/my-integrations](https://www.notion.so/my-integrations) and **share the database with it** (database page → ⋯ → Connections).

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

| Variable             | Required | Description                                                                 |
| -------------------- | -------- | --------------------------------------------------------------------------- |
| `NOTION_TOKEN`       | yes      | The integration's Internal Integration Secret                               |
| `NOTION_DATABASE_ID` | yes      | The database ID from its URL                                                 |
| `SESSION_SECRET`     | yes      | ≥ 32 chars; encrypts the session cookie. `openssl rand -hex 32`             |
| `INDEX_PASSWORD`     | yes      | Password for the `/letters` index. If unset, the index stays locked forever |

(The example file also lists Upstash variables for rate limiting the unlock endpoint — that integration isn't wired up yet, so they currently have no effect.)

### 3. Run

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Writing a letter

1. Add a row to the Notion database and write the letter as the page content.
2. Fill in `Title`, `Slug`, `Password`, `Date`, and optionally `Excerpt`.
3. Check `Published`.
4. Within a minute (ISR) it appears at `/p/<slug>` and on the `/letters` index.
5. Share the link and the password. 💌

## Security notes

- Locked pages never fetch or embed the letter content — the gate is enforced server-side, not hidden with CSS.
- Passwords are compared with `timingSafeEqual`; wrong-password and nonexistent-slug responses are identical to prevent enumeration.
- Every response carries `X-Robots-Tag: noindex, nofollow` (see `next.config.ts`), pages set the equivalent meta tag, and `robots.ts` disallows all crawlers.
- Passwords are stored in plaintext in Notion. That's a deliberate trade-off for a low-stakes personal site — don't reuse passwords that matter here.
