import * as React from "react"
import {
  ChevronDownIcon,
  Loader2Icon,
  SendHorizontalIcon,
  SparklesIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/features/auth"
import { ApiError } from "@/lib/api/client"
import { platformsApi } from "@/lib/api/platforms-api"
import type { UserPlatformListItem } from "@/lib/api/platform-types"
import { cn } from "@/lib/utils"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  platformName?: string
  createdAt: number
}

const suggestionPrompts = [
  "خلاصه‌ای از وضعیت فعلی این پلتفرم بده",
  "چطور می‌تونم پیکربندی رو بهتر کنم؟",
  "یک گزارش سریع از منابع پلتفرم بنویس",
] as const

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function PlatformSelect({
  platforms,
  value,
  onChange,
  disabled,
  className,
}: {
  platforms: UserPlatformListItem[]
  value: string | null
  onChange: (platformId: string) => void
  disabled?: boolean
  className?: string
}) {
  const selected = value
    ? platforms.find((platform) => platform.platformId === value)
    : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || platforms.length === 0}
        render={
          <button
            type="button"
            className={cn(
              "inline-flex h-9 min-w-0 items-center gap-2 rounded-[4px] border border-white/12 bg-background/70 px-3.5 text-xs font-light transition-colors",
              "hover:border-white/20 hover:bg-background",
              "disabled:pointer-events-none disabled:opacity-50",
              "data-popup-open:border-primary/40 data-popup-open:bg-primary/5",
              className
            )}
            aria-label="انتخاب پلتفرم"
          />
        }
      >
        <span className="truncate text-foreground">
          {selected ? selected.name : "انتخاب پلتفرم"}
        </span>
        {selected ? (
          <Badge
            variant="secondary"
            className="rounded-[4px] border-0 bg-primary/15 px-1.5 py-0 text-[10px] font-light text-primary"
          >
            {selected.planName}
          </Badge>
        ) : null}
        <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        sideOffset={8}
        className="min-w-60 rounded-[4px] border border-white/10 bg-popover/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
      >
        {platforms.map((platform) => (
          <DropdownMenuItem
            key={platform.platformId}
            className={cn(
              "rounded-[4px] px-3 py-2.5 text-xs font-light",
              value === platform.platformId && "bg-primary/10 text-primary"
            )}
            onClick={() => onChange(platform.platformId)}
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm">{platform.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">
                {platform.planName}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ChatMessageRow({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "w-full",
        isUser ? "bg-transparent" : "bg-white/[0.02]"
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl gap-4 px-4 py-6 sm:px-6">
        <div
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[4px] text-[11px] font-medium",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-white/10 bg-card text-primary"
          )}
        >
          {isUser ? "شما" : <SparklesIcon className="size-3.5" />}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-light text-muted-foreground">
            <span className="text-foreground">
              {isUser ? "شما" : "دستیار هوشمند"}
            </span>
            {message.platformName ? (
              <span className="rounded-[4px] bg-white/5 px-2 py-0.5 text-[10px]">
                {message.platformName}
              </span>
            ) : null}
          </div>
          <p className="whitespace-pre-wrap text-sm font-light leading-7 text-pretty text-foreground sm:text-[15px] sm:leading-8">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  )
}

export function SmartAssistantPage() {
  const { logout } = useAuth()
  const [platforms, setPlatforms] = React.useState<UserPlatformListItem[]>([])
  const [isLoadingPlatforms, setIsLoadingPlatforms] = React.useState(true)
  const [platformId, setPlatformId] = React.useState<string | null>(null)
  const [prompt, setPrompt] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [isSending, setIsSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const selectedPlatform = platformId
    ? platforms.find((platform) => platform.platformId === platformId)
    : null
  const hasMessages = messages.length > 0

  React.useEffect(() => {
    let cancelled = false

    async function loadPlatforms() {
      setIsLoadingPlatforms(true)

      try {
        const result = await platformsApi.getPlatforms()
        if (cancelled) return

        setPlatforms(result)
        setError(null)

        if (result.length === 1) {
          setPlatformId(result[0].platformId)
        }
      } catch (err) {
        if (cancelled) return

        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }

        setError(
          err instanceof Error
            ? err.message
            : "بارگذاری پلتفرم‌ها ناموفق بود."
        )
      } finally {
        if (!cancelled) setIsLoadingPlatforms(false)
      }
    }

    void loadPlatforms()

    return () => {
      cancelled = true
    }
  }, [logout])

  React.useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTop = list.scrollHeight
  }, [messages, isSending])

  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  React.useEffect(() => {
    resizeTextarea()
  }, [prompt])

  function sendPrompt(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed || isSending) return

    if (!selectedPlatform) {
      setError("ابتدا یک پلتفرم انتخاب کنید.")
      return
    }

    setError(null)
    setPrompt("")
    setIsSending(true)

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      platformName: selectedPlatform.name,
      createdAt: Date.now(),
    }

    setMessages((current) => [...current, userMessage])

    window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: `پیام شما برای پلتفرم «${selectedPlatform.name}» دریافت شد.\n\nاتصال دستیار هوشمند به‌زودی فعال می‌شود؛ فعلاً این یک پیش‌نمایش رابط کاربری است.`,
        platformName: selectedPlatform.name,
        createdAt: Date.now(),
      }

      setMessages((current) => [...current, assistantMessage])
      setIsSending(false)
    }, 700)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendPrompt(prompt)
    }
  }

  const composer = (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      {error ? (
        <p className="mb-2 text-center text-xs font-light text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {platforms.length === 0 && !isLoadingPlatforms ? (
        <p className="mb-3 text-center text-xs font-light text-muted-foreground">
          هنوز پلتفرمی ندارید. ابتدا از بخش پلتفرم‌ها یکی بسازید.
        </p>
      ) : null}

      <div
        className={cn(
          "rounded-[4px] border border-white/12 bg-card/80 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-md",
          "focus-within:border-primary/35"
        )}
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            selectedPlatform
              ? "هر چیزی بپرسید..."
              : "ابتدا پلتفرم را انتخاب کنید..."
          }
          disabled={isSending || platforms.length === 0}
          className="max-h-52 min-h-[52px] w-full resize-none bg-transparent px-5 pt-4 pb-2 text-sm font-light leading-7 text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          {isLoadingPlatforms ? (
            <div className="flex items-center gap-1.5 px-2 text-xs font-light text-muted-foreground">
              <Loader2Icon className="size-3.5 animate-spin" />
              بارگذاری پلتفرم‌ها
            </div>
          ) : (
            <PlatformSelect
              platforms={platforms}
              value={platformId}
              onChange={setPlatformId}
              disabled={isSending}
            />
          )}

          <Button
            type="button"
            size="icon-sm"
            disabled={
              isSending ||
              !prompt.trim() ||
              !selectedPlatform ||
              platforms.length === 0
            }
            className="size-9 shrink-0 rounded-[4px]"
            onClick={() => sendPrompt(prompt)}
            aria-label="ارسال پیام"
          >
            {isSending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendHorizontalIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] font-light text-muted-foreground">
        Enter برای ارسال · Shift+Enter برای خط جدید
      </p>
    </div>
  )

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      {!hasMessages ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
            <div className="mb-8 flex flex-col items-center gap-4 text-center">
              <span className="flex size-14 items-center justify-center rounded-[4px] border border-primary/20 bg-primary/10 text-primary">
                <SparklesIcon className="size-6" />
              </span>
              <h2 className="font-heading max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                چطور می‌تونم کمکتون کنم؟
              </h2>
              <p className="max-w-md text-sm font-light leading-7 text-muted-foreground">
                پلتفرم را انتخاب کنید و پرامپت بدهید. دستیار روی همان پلتفرم
                پاسخ می‌دهد.
              </p>
            </div>

            <div className="mb-8 flex w-full max-w-3xl flex-wrap justify-center gap-2">
              {suggestionPrompts.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={!selectedPlatform || isSending || platforms.length === 0}
                  onClick={() => sendPrompt(item)}
                  className={cn(
                    "rounded-[4px] border border-white/12 bg-card/70 px-3.5 py-2 text-xs font-light text-muted-foreground transition-colors",
                    "hover:border-white/20 hover:bg-card hover:text-foreground",
                    "disabled:pointer-events-none disabled:opacity-40"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="w-full">{composer}</div>
          </div>
        </div>
      ) : (
        <>
          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="pb-4">
              {messages.map((message) => (
                <ChatMessageRow key={message.id} message={message} />
              ))}

              {isSending ? (
                <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-6 text-xs font-light text-muted-foreground sm:px-6">
                  <Loader2Icon className="size-4 animate-spin text-primary" />
                  در حال فکر کردن...
                </div>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 border-t border-white/8 bg-background/90 py-4 backdrop-blur-md">
            {composer}
          </div>
        </>
      )}
    </div>
  )
}
