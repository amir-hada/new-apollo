import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            دسته بندی محصولات
          </CardTitle>
          <CardDescription className="font-light">به‌زودی</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
