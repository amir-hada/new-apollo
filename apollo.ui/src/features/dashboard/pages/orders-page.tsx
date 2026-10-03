import { PackageIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-dashed border-border/80 bg-muted/10">
        <CardHeader className="items-center text-center">
          <div className="flex size-12 items-center justify-center rounded bg-primary/10 text-primary">
            <PackageIcon className="size-5" />
          </div>
          <CardTitle className="text-base font-medium">
            سفارشی ثبت نشده
          </CardTitle>
          <CardDescription className="max-w-md font-light">
            پس از ثبت اولین سفارش، جزئیات آن در این بخش نمایش داده می‌شود.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8" />
      </Card>
    </div>
  )
}
