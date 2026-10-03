import { Link } from "react-router-dom"
import { PhoneIcon } from "lucide-react"

import { BrandLogo } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"
import { useScrolled } from "@/hooks/use-scrolled"
import { cn } from "@/lib/utils"

import { navigationLinks } from "../data/navigation"
import { MobileNav } from "./mobile-nav"

export function HeroNavbar() {
  const isScrolled = useScrolled()

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out",
        isScrolled
          ? "border-b border-border/60 bg-background/90 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="flex h-16 w-full items-center justify-between gap-4 px-3 sm:px-4 lg:px-5">
        <div className="flex items-center gap-3 md:gap-4">
          <BrandLogo
            variant="full"
            withWordmark={false}
            className="shrink-0"
            logoClassName="h-14 w-auto"
          />
          <nav
            aria-label="ناوبری اصلی"
            className="hidden items-center gap-0.5 md:flex"
          >
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded px-3 py-2 text-sm font-normal text-white transition-colors hover:text-white/80"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex h-9 items-center gap-3">
          <a
            href="tel:02177213455"
            dir="ltr"
            className="hidden h-9 items-center gap-1.5 text-sm leading-none font-normal text-white transition-colors hover:text-white/80 sm:inline-flex"
          >
            <PhoneIcon aria-hidden className="size-4 shrink-0" />
            <span>۰۲۱-۷۷۲۱۳۴۵۵</span>
          </a>
          <Button
            className="hidden h-9 px-4 text-sm leading-none font-normal sm:inline-flex"
            render={<Link to="/auth" />}
          >
            ورود | ثبت نام
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
