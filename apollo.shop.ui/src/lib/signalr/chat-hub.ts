import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { getAccessToken } from "@/lib/auth-store";
import { API_URL, getClientTenantSlug } from "@/lib/tenant";
import type {
  ChatMessage,
  ChatMessagesRead,
} from "@/features/admin/chats/data/chat-types";

export type ConversationUpdatedPayload = {
  conversationId: string;
  customerUserId: string;
};

export function createChatHubConnection() {
  const tenant = getClientTenantSlug();
  return new HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/chat?tenant=${encodeURIComponent(tenant)}`, {
      accessTokenFactory: () => getAccessToken() ?? "",
    })
    .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
    .configureLogging(
      process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Warning,
    )
    .build();
}

export async function startChatHub(connection: HubConnection): Promise<void> {
  if (
    connection.state === HubConnectionState.Connected ||
    connection.state === HubConnectionState.Connecting
  ) {
    return;
  }
  await connection.start();
}

export function subscribeChatHub(
  connection: HubConnection,
  handlers: {
    onMessage: (message: ChatMessage) => void;
    onConversationUpdated: (payload: ConversationUpdatedPayload) => void;
    onMessagesRead?: (payload: ChatMessagesRead) => void;
  },
) {
  connection.on("ReceiveMessage", handlers.onMessage);
  connection.on("ConversationUpdated", handlers.onConversationUpdated);
  if (handlers.onMessagesRead) {
    connection.on("MessagesRead", handlers.onMessagesRead);
  }
}

export function unsubscribeChatHub(connection: HubConnection) {
  connection.off("ReceiveMessage");
  connection.off("ConversationUpdated");
  connection.off("MessagesRead");
}
