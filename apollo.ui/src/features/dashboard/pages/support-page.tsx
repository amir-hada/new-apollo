import { HeadphonesIcon, MessageSquareIcon, PhoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const supportChannels = [
  {
    title: "تیکت پشتیبانی",
    description: "درخواست خود را ثبت کنید و پیگیری کنید.",
    icon: MessageSquareIcon,
    action: "ثبت تیکت",
  },
  {
    title: "تماس تلفنی",
    description: "شنبه تا پنج‌شنبه، ۹ تا ۱۸",
    icon: PhoneIcon,
    action: "۰۲۱-۷۷۲۱۳۴۵۵",
  },
]

export function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        {supportChannels.map((channel) => (
          <Card key={channel.title} className="border-border/60 bg-card/80">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
                <channel.icon className="size-4" />
              </div>
              <CardTitle className="text-base font-medium">
                {channel.title}
              </CardTitle>
              <CardDescription className="font-light">
                {channel.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="font-normal">
                {channel.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-muted/15">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded bg-background text-primary">
            <HeadphonesIcon className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-medium">
              سوالات متداول
            </CardTitle>
            <CardDescription className="font-light">
              پاسخ سریع به رایج‌ترین سوالات کاربران
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-light text-muted-foreground">
            به‌زودی راهنمای کامل پشتیبانی در این بخش قرار می‌گیرد.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
