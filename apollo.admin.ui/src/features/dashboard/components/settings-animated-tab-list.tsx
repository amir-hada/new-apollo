import * as React from "react"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const settingsTabTriggerClass =
  "inline-flex shrink-0 grow-0 basis-auto items-center gap-1.5 rounded-none border-0 bg-transparent px-0 pb-3 pt-0 text-xs font-light shadow-none transition-colors duration-300 ease-out after:hidden data-active:text-foreground text-muted-foreground hover:text-foreground/80 [&_svg]:size-3.5 [&_svg]:shrink-0"

type TabIndicatorContextValue = {
  registerTab: (value: string, element: HTMLElement | null) => void
}

const TabIndicatorContext = React.createContext<TabIndicatorContextValue | null>(
  null
)

type SettingsAnimatedTabListProps = {
  activeTab: string
  className?: string
  children: React.ReactNode
}

export function SettingsAnimatedTabList({
  activeTab,
  className,
  children,
}: SettingsAnimatedTabListProps) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const tabRefs = React.useRef(new Map<string, HTMLElement>())
  const [indicator, setIndicator] = React.useState({ width: 0, x: 0 })

  const updateIndicator = React.useCallback(() => {
    const list = listRef.current
    const activeElement = tabRefs.current.get(activeTab)

    if (!list || !activeElement) return

    const listRect = list.getBoundingClientRect()
    const tabRect = activeElement.getBoundingClientRect()

    setIndicator({
      width: tabRect.width,
      x: tabRect.left - listRect.left,
    })
  }, [activeTab])

  const updateIndicatorRef = React.useRef(updateIndicator)
  updateIndicatorRef.current = updateIndicator

  const registerTab = React.useCallback((value: string, element: HTMLElement | null) => {
    if (element) {
      tabRefs.current.set(value, element)
    } else {
      tabRefs.current.delete(value)
    }

    window.requestAnimationFrame(() => {
      updateIndicatorRef.current()
    })
  }, [])

  React.useLayoutEffect(() => {
    updateIndicator()

    const frame = window.requestAnimationFrame(() => {
      updateIndicator()
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [updateIndicator, children])

  React.useEffect(() => {
    const list = listRef.current
    if (!list) return

    const resizeObserver = new ResizeObserver(() => {
      updateIndicator()
    })

    resizeObserver.observe(list)
    window.addEventListener("resize", updateIndicator)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateIndicator)
    }
  }, [updateIndicator])

  const contextValue = React.useMemo(
    () => ({
      registerTab,
    }),
    [registerTab]
  )

  return (
    <TabIndicatorContext.Provider value={contextValue}>
      <div
        ref={listRef}
        className={cn("relative border-b border-white/10", className)}
      >
        <TabsList
          variant="line"
          className="relative z-10 h-auto w-full max-w-full flex-wrap justify-start gap-x-6 gap-y-2 rounded-none border-0 bg-transparent p-0"
        >
          {children}
        </TabsList>

        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 z-20 h-0.5 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          style={{
            left: indicator.x,
            width: indicator.width,
          }}
        />
      </div>
    </TabIndicatorContext.Provider>
  )
}

export function SettingsTabTrigger({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  const context = React.useContext(TabIndicatorContext)

  const setRef = React.useCallback(
    (element: HTMLElement | null) => {
      context?.registerTab(value, element)
    },
    [context, value]
  )

  return (
    <TabsTrigger ref={setRef} value={value} className={settingsTabTriggerClass}>
      {children}
    </TabsTrigger>
  )
}
