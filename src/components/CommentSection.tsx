"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CommentResult } from "@/app/p/[slug]/actions";
import type { Dict } from "@/lib/i18n";

interface Comment {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface Props {
  comments: Comment[];
  action: (_prev: CommentResult, formData: FormData) => Promise<CommentResult>;
  labels: Dict["comments"];
}

function formatCommentDate(iso: string): string {
  return iso.slice(0, 10);
}

export default function CommentSection({ comments, action, labels }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, { success: false });

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <section className="mt-16 pt-8 border-t border-[#37352f]/10">
      <h2 className="font-serif text-lg text-[#37352f]/60 mb-8 text-center tracking-widest">
        {labels.heading}
      </h2>

      {comments.length === 0 && (
        <p className="text-center text-sm text-[#37352f]/30 mb-8">{labels.empty}</p>
      )}

      {comments.length > 0 && (
        <ul className="space-y-6 mb-10">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 text-rose-400 flex items-center justify-center text-sm font-serif select-none">
                {(c.name || labels.anonymous).slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-[#37352f]/70">{c.name || labels.anonymous}</span>
                  <span className="text-xs text-[#37352f]/30">{formatCommentDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-[#37352f]/80 leading-relaxed whitespace-pre-wrap break-words">
                  {c.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder={labels.namePlaceholder}
          maxLength={50}
          className="w-full px-3 py-2 text-sm bg-transparent border border-[#37352f]/15 rounded-[3px] text-[#37352f] placeholder-[#37352f]/30 focus:outline-none focus:border-rose-300 transition-colors"
        />
        <textarea
          name="message"
          placeholder={labels.messagePlaceholder}
          required
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2 text-sm bg-transparent border border-[#37352f]/15 rounded-[3px] text-[#37352f] placeholder-[#37352f]/30 focus:outline-none focus:border-rose-300 transition-colors resize-none"
        />
        {state.error && (
          <p className="text-xs text-rose-400">{state.error}</p>
        )}
        {state.success && (
          <p className="text-xs text-[#37352f]/40">{labels.sent}</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-1.5 text-sm text-[#37352f]/60 border border-[#37352f]/15 rounded-[3px] hover:border-rose-300 hover:text-rose-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? labels.sending : labels.send}
          </button>
        </div>
      </form>
    </section>
  );
}
