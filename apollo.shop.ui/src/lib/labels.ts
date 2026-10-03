import type {
  BlogPostStatus,
  OrderStatus,
  ProductStatus,
  TicketPriority,
  TicketStatus,
} from "@/types/api";

export const orderStatusLabel: Record<OrderStatus, string> = {
  0: "در انتظار پرداخت",
  1: "پرداخت‌شده",
  2: "در حال پردازش",
  3: "ارسال‌شده",
  4: "تحویل‌شده",
  5: "لغو‌شده",
  6: "مرجوع‌شده",
};

export const productStatusLabel: Record<ProductStatus, string> = {
  0: "پیش‌نویس",
  1: "منتشرشده",
  2: "آرشیو",
};

export const ticketStatusLabel: Record<TicketStatus, string> = {
  0: "باز",
  1: "در حال بررسی",
  2: "منتظر پاسخ مشتری",
  3: "حل‌شده",
  4: "بسته",
};

export const ticketPriorityLabel: Record<TicketPriority, string> = {
  0: "کم",
  1: "متوسط",
  2: "بالا",
  3: "فوری",
};

export const blogStatusLabel: Record<BlogPostStatus, string> = {
  0: "پیش‌نویس",
  1: "منتشرشده",
  2: "آرشیو",
};
