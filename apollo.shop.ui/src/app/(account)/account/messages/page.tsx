import { SupportChat } from "@/features/account/SupportChat";

export default function AccountMessagesPage() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-[15px] font-bold">پیام‌ها و پشتیبانی</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          گفتگوی مستقیم و لحظه‌ای با تیم فروشگاه
        </p>
      </div>
      <SupportChat />
    </div>
  );
}
