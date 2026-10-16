export type ChatUserSearch = {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
};

export type ChatConversation = {
  id: string;
  customerUserId: string;
  customerFullName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAvatarUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAtUtc: string | null;
  unreadCount: number;
  peerFullName?: string | null;
  peerAvatarUrl?: string | null;
  peerLastReadAtUtc?: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderFullName: string;
  isMine: boolean;
  body: string;
  createdAtUtc: string;
  senderAvatarUrl?: string | null;
  isRead?: boolean;
};

export type ChatMessagesRead = {
  conversationId: string;
  readerUserId: string;
  readAtUtc: string;
  readerIsAdmin: boolean;
};
