/**
 * UI dictionaries — shared between Server and Client Components (no server-only
 * imports here). The current locale is stored in the `ml_lang` cookie; see
 * `src/lib/locale.ts` for the server-side reader and `LangSwitch` for the
 * client-side writer.
 */

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "ml_lang";

const en = {
  /** BCP 47 tag for the <html lang> attribute. */
  htmlLang: "en",

  home: {
    greeting: "Hi, you've received a new letter.",
  },

  letters: {
    title: "All Letters",
    subtitle: "Enter the password to view all letters",
    empty: "No letters yet.",
  },

  post: {
    notFound: "Not Found",
    back: "← All letters",
    prev: "← Newer",
    next: "Older →",
  },

  password: {
    fallbackTitle: "This letter is password-protected",
    subtitle: "Enter the password to read",
    label: "Password",
    placeholder: "Password",
    pending: "Checking…",
    submit: "Enter",
    required: "Please enter the password",
    wrong: "Incorrect password",
  },

  comments: {
    heading: "Comments",
    empty: "No comments yet — say something!",
    namePlaceholder: "Your name (optional)",
    messagePlaceholder: "Leave a message…",
    sent: "Comment sent ✦",
    sending: "Sending…",
    send: "Send",
    writeSomething: "Please write something",
    tooLong: "Comments are limited to 500 characters",
    anonymous: "Anonymous",
  },

  toc: "Contents",

  notFound: {
    title: "Not Found",
    body: "This page doesn't exist, or hasn't been published yet.",
  },

  /** Label on the language switch button — names the language it switches TO. */
  switchLabel: "中文",
  switchTo: "zh" as Locale,
};

export type Dict = typeof en;

const zh: Dict = {
  htmlLang: "zh-CN",

  home: {
    greeting: "Hi，你收到一封新的信件。",
  },

  letters: {
    title: "所有信",
    subtitle: "输入密码后即可查看全部信件",
    empty: "还没有信。",
  },

  post: {
    notFound: "未找到",
    back: "← 所有信",
    prev: "← 上一篇",
    next: "下一篇 →",
  },

  password: {
    fallbackTitle: "这篇文章受密码保护",
    subtitle: "输入密码后即可阅读",
    label: "密码",
    placeholder: "密码",
    pending: "验证中…",
    submit: "进入",
    required: "请输入密码",
    wrong: "密码不正确",
  },

  comments: {
    heading: "留言",
    empty: "还没有留言，来说点什么吧",
    namePlaceholder: "你的名字（选填）",
    messagePlaceholder: "留下你的话……",
    sent: "留言已发送 ✦",
    sending: "发送中…",
    send: "发送",
    writeSomething: "请写点什么吧",
    tooLong: "留言不能超过 500 字",
    anonymous: "匿名",
  },

  toc: "目录",

  notFound: {
    title: "未找到",
    body: "这个页面不存在，或者还未发布。",
  },

  switchLabel: "EN",
  switchTo: "en" as Locale,
};

const dictionaries: Record<Locale, Dict> = { en, zh };

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
