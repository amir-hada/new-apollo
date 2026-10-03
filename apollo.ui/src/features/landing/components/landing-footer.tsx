import { BrandLogo } from "@/components/shared/brand-logo"
import { Container } from "@/components/shared/container"
import { Separator } from "@/components/ui/separator"

import { footerLinkGroups } from "../data/footer-links"

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <Container className="flex flex-col gap-10 py-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="flex max-w-sm flex-col gap-4">
            <BrandLogo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              آپولو؛ ساده‌ترین راه برای طراحی، ساخت و انتشار پلتفرم آنلاین شما.
              بدون کدنویسی، در چند دقیقه.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerLinkGroups.map((group) => (
              <nav
                key={group.title}
                aria-label={group.title}
                className="flex flex-col gap-3"
              >
                <h3 className="text-sm font-semibold">{group.title}</h3>
                {group.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            ))}
          </div>
        </div>
        <Separator />
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span>© ۱۴۰۵ آپولو — تمامی حقوق محفوظ است.</span>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              حریم خصوصی
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              قوانین استفاده
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
