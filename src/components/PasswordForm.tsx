"use client";

import { useActionState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UnlockResult } from "@/app/p/[slug]/actions";

interface Props {
  title: string;
  subtitle?: string;
  /** A bound server action that receives the plaintext attempt and returns an UnlockResult. */
  action: (attempt: string) => Promise<UnlockResult>;
}

const initialState: UnlockResult = { success: false };

export default function PasswordForm({
  title,
  subtitle = "输入密码后即可阅读",
  action,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: UnlockResult, formData: FormData) => {
      const attempt = formData.get("password") as string;
      return action(attempt);
    },
    initialState
  );

  // Refresh the page after successful unlock so the Server Component
  // re-renders with the full content.
  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  // Focus password input on error
  useEffect(() => {
    if (state.error) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [state.error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#faf8f5]">
      <div className="w-full max-w-sm">
        {/* Decorative header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4 text-rose-300 text-4xl select-none">
            ✦
          </div>
          <h1 className="font-serif text-2xl text-stone-800 leading-snug">
            {title || "这篇文章受密码保护"}
          </h1>
          <p className="mt-2 text-sm text-stone-400">{subtitle}</p>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              密码
            </label>
            <input
              ref={inputRef}
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              placeholder="密码"
              className={`
                w-full rounded-xl border px-4 py-3 text-base text-stone-800
                placeholder:text-stone-300 bg-white shadow-sm
                outline-none transition
                focus:ring-2 focus:ring-rose-200 focus:border-rose-300
                ${state.error ? "border-red-300" : "border-stone-200"}
              `}
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-500 text-center" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            onTouchEnd={(e) => {
              // On mobile, the first tap on the button dismisses the keyboard
              // (input blur) and the synthesized click event never fires.
              // Submitting on touchend bypasses that entirely.
              if (!pending) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            className="
              w-full rounded-xl bg-stone-800 text-white py-3 text-sm
              font-medium tracking-wide transition
              hover:bg-stone-700 active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {pending ? "验证中…" : "进入"}
          </button>
        </form>
      </div>
    </div>
  );
}
