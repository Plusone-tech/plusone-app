import { API_BASE } from "./api";

export function connectChat(conversationId: string, userId: string) {
  const wsUrl =
    API_BASE.replace(/^http/, "ws") +
    `/ws?conversationId=${encodeURIComponent(
      conversationId
    )}&userId=${encodeURIComponent(userId)}`;
  const socket = new WebSocket(wsUrl);
  return socket;
}
