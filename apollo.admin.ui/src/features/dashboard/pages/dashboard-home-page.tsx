import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/features/auth/context/auth-provider"
import { getUserDisplayName } from "@/lib/auth/user-display"

export function DashboardHomePage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const displayName = getUserDisplayName(user)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-6">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              خوش آمدید، {displayName}
            </CardTitle>
            <CardDescription className="font-light">
              به پنل مدیریت آپولو خوش آمدید. از منوی کناری می‌توانید کاربران،
              محصولات و تنظیمات را مدیریت کنید.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
