"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { resolveProductImageUrl } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import type { HomeStory } from "@/types/api";

function StoryViewer({
  stories,
  startIndex,
  onClose,
}: {
  stories: HomeStory[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const current = stories[index];

  const goNext = useCallback(() => {
    setProgress(0);
    if (index >= stories.length - 1) {
      onClose();
      return;
    }
    setIndex((v) => v + 1);
  }, [index, onClose, stories.length]);

  const goPrev = useCallback(() => {
    setProgress(0);
    if (index <= 0) return;
    setIndex((v) => v - 1);
  }, [index]);

  useEffect(() => {
    setIndex(startIndex);
    setProgress(0);
  }, [startIndex]);

  useEffect(() => {
    const started = Date.now();
    const duration = 5000;
    const tick = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / duration);
      setProgress(p);
      if (p >= 1) goNext();
    }, 40);
    return () => window.clearInterval(tick);
  }, [goNext, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [goNext, goPrev, onClose]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-3 sm:p-6">
      <button
        type="button"
        aria-label="بستن"
        onClick={onClose}
        className="absolute end-3 top-3 z-20 inline-flex size-10 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      <div className="relative w-full max-w-[420px] overflow-hidden rounded-md bg-black shadow-2xl">
        <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-2 pt-2">
          {stories.map((s, i) => (
            <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white transition-[width] duration-75 ease-linear"
                style={{
                  width:
                    i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="relative aspect-[9/16] max-h-[min(80vh,720px)] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveProductImageUrl(current.imageUrl)}
            alt={current.title}
            className="absolute inset-0 size-full object-cover"
          />

          <button
            type="button"
            aria-label="قبلی"
            className="absolute inset-y-0 start-0 z-10 w-1/3"
            onClick={goPrev}
          />
          <button
            type="button"
            aria-label="بعدی"
            className="absolute inset-y-0 end-0 z-10 w-1/3"
            onClick={goNext}
          />

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
            <p className="text-sm font-bold text-white">{current.title}</p>
            {current.linkUrl ? (
              <Link
                href={current.linkUrl}
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-[#3f4064]"
              >
                مشاهده
                <ChevronLeft className="size-3.5" />
              </Link>
            ) : null}
          </div>
        </div>

        {stories.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="استوری قبلی"
              onClick={goPrev}
              className="absolute start-2 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-md bg-white/90 text-[#3f4064] sm:flex"
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              type="button"
              aria-label="استوری بعدی"
              onClick={goNext}
              className="absolute end-2 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-md bg-white/90 text-[#3f4064] sm:flex"
            >
              <ChevronLeft className="size-5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function HomeStories({ stories }: { stories: HomeStory[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = stories.filter((s) => !!s.imageUrl);

  if (items.length === 0) return null;

  return (
    <>
      <section className="w-full px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={cn(
            "flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:gap-4",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {items.map((story, index) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="flex w-[72px] shrink-0 snap-start flex-col items-center gap-1.5 sm:w-[80px]"
            >
              <span className="rounded-full bg-[linear-gradient(135deg,var(--primary),color-mix(in_oklab,var(--primary)_55%,#f59e0b))] p-[2.5px]">
                <span className="block rounded-full bg-background p-[2px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveProductImageUrl(story.imageUrl)}
                    alt=""
                    className="size-[60px] rounded-full object-cover sm:size-[68px]"
                  />
                </span>
              </span>
              <span className="line-clamp-2 w-full text-center text-[11px] leading-4 text-[#3f4064] dark:text-foreground">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {openIndex != null ? (
        <StoryViewer
          stories={items}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </>
  );
}
