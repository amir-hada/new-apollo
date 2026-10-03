import * as React from "react"
import { Link } from "react-router-dom"
import { MenuIcon, PhoneIcon } from "lucide-react"

import { BrandLogo } from "@/components/shared/brand-logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { navigationLinks } from "../data/navigation"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white md:hidden"
            aria-label="باز کردن منو"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="sr-only">منوی اصلی آپولو</SheetTitle>
          <BrandLogo
            variant="full"
            withWordmark={false}
            className="shrink-0"
            logoClassName="h-12 w-auto"
          />
        </SheetHeader>
        <nav aria-label="ناوبری موبایل" className="flex flex-col gap-1 px-2">
          {navigationLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-2.5 text-base font-normal text-foreground transition-colors hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <SheetFooter className="flex-col gap-3 sm:flex-col">
          <a
            href="tel:02177213455"
            dir="ltr"
            className="inline-flex items-center justify-center gap-1.5 text-sm font-normal text-white transition-colors hover:text-white/80"
          >
            <PhoneIcon aria-hidden className="size-4 shrink-0" />
            <span>۰۲۱-۷۷۲۱۳۴۵۵</span>
          </a>
          <Button
            className="h-9 w-full px-5 font-normal"
            render={<Link to="/auth" onClick={() => setOpen(false)} />}
          >
            ورود | ثبت نام
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
