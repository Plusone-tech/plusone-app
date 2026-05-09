import * as SecureStore from "expo-secure-store";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

const TOKEN_KEY = "auth_token";

// Token management functions
export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;

  console.log(`[apiFetch] ${options.method || "GET"} ${url}`);

  // Get stored token and add to headers
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Log the request body for debugging (truncated)
  if (options.body) {
    const bodyStr =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
    console.log(`[apiFetch] Request body:`, bodyStr.substring(0, 500));
  }

  const res = await fetch(url, {
    credentials: "include",
    headers,
    ...options,
  });

  console.log(`[apiFetch] Response status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let responseBody: any = null;
    try {
      responseBody = await res.json();
      console.error(
        `[apiFetch] Error response body:`,
        JSON.stringify(responseBody, null, 2),
      );
      // Extract a readable error message
      const rawError = responseBody?.error;
      if (typeof rawError === "string") {
        message = rawError;
      } else if (
        rawError?.fieldErrors &&
        typeof rawError.fieldErrors === "object"
      ) {
        // Zod validation error shape: { formErrors: [], fieldErrors: { field: ["msg"] } }
        const fieldMessages = Object.entries(rawError.fieldErrors)
          .map(
            ([field, msgs]: [string, any]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
          )
          .join("\n");
        message = fieldMessages || JSON.stringify(rawError);
      } else if (
        responseBody?.message &&
        typeof responseBody.message === "string"
      ) {
        message = responseBody.message;
      } else {
        message =
          typeof responseBody === "string"
            ? responseBody
            : JSON.stringify(responseBody);
      }
    } catch {
      try {
        const textBody = await res.text();
        console.error(`[apiFetch] Error response text:`, textBody);
        message = textBody || message;
      } catch {
        // ignore
      }
    }
    console.error(`[apiFetch] ❌ Error: ${message}`);
    const err = new Error(message);
    // @ts-expect-error attach status
    err.status = res.status;
    throw err;
  }

  try {
    const data = await res.json();
    console.log(`[apiFetch] ✅ Success`);
    return data;
  } catch {
    return null;
  }
}

export const api = {
  me: () => apiFetch("/auth/me"),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  events: {
    list: () => apiFetch("/events"),
    my: () => apiFetch("/events/my"),
    detail: (id: string) => apiFetch(`/events/${id}`),
    create: (payload: any) =>
      apiFetch("/events", { method: "POST", body: JSON.stringify(payload) }),
    join: (id: string) => apiFetch(`/events/${id}/join`, { method: "POST" }),
    leave: (id: string) => apiFetch(`/events/${id}/leave`, { method: "POST" }),
    delete: (id: string) => apiFetch(`/events/${id}`, { method: "DELETE" }),
  },
  bookmarks: {
    list: () => apiFetch("/bookmarks"),
    check: (eventIds: string[]) =>
      apiFetch("/bookmarks/check", {
        method: "POST",
        body: JSON.stringify({ eventIds }),
      }),
    add: (eventId: string) =>
      apiFetch(`/bookmarks/${eventId}`, { method: "POST" }),
    remove: (eventId: string) =>
      apiFetch(`/bookmarks/${eventId}`, { method: "DELETE" }),
  },
  profile: {
    get: () => apiFetch("/profile"),
    stats: () => apiFetch("/profile/stats"),
    update: (payload: any) =>
      apiFetch("/profile", { method: "PUT", body: JSON.stringify(payload) }),
    changePassword: (payload: any) =>
      apiFetch("/profile/password", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    getPrivacy: () => apiFetch("/profile/privacy"),
    updatePrivacy: (payload: any) =>
      apiFetch("/profile/privacy", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    deleteAccount: () => apiFetch("/profile", { method: "DELETE" }),
    getInterests: () => apiFetch("/profile/interests"),
    updateInterests: (interests: string[]) =>
      apiFetch("/profile/interests", {
        method: "POST",
        body: JSON.stringify({ interests }),
      }),
    acceptLegal: (payload: { eula_version: string }) =>
      apiFetch("/profile/accept-legal", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    completeOnboarding: (payload: any) =>
      apiFetch("/profile/complete-onboarding", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  notifications: {
    list: () => apiFetch("/notifications"),
    markRead: () => apiFetch("/notifications/read", { method: "POST" }),
  },
  chat: {
    list: () => apiFetch("/chat"),
    messages: (conversationId: string) => apiFetch(`/chat/${conversationId}`),
    send: (conversationId: string, body: string) =>
      apiFetch(`/chat/${conversationId}`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    markRead: (conversationId: string) =>
      apiFetch(`/chat/${conversationId}/read`, { method: "POST" }),
  },
  uploads: {
    // Get presigned URL for direct client upload
    getPresignedUrl: (folder: "profiles" | "events", contentType: string) =>
      apiFetch("/uploads/presigned-url", {
        method: "POST",
        body: JSON.stringify({ folder, contentType }),
      }),
    // Upload profile picture directly (multipart form)
    uploadProfilePicture: async (uri: string, mimeType: string) => {
      const formData = new FormData();
      formData.append("image", {
        uri,
        type: mimeType,
        name: `profile.${mimeType.split("/")[1] || "jpg"}`,
      } as any);

      // Get token for Authorization header
      const token = await getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/uploads/profile-picture`, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Upload failed");
      }
      return res.json();
    },
    // Upload event image directly (multipart form)
    uploadEventImage: async (uri: string, mimeType: string) => {
      const formData = new FormData();
      formData.append("image", {
        uri,
        type: mimeType,
        name: `event.${mimeType.split("/")[1] || "jpg"}`,
      } as any);

      // Get token for Authorization header
      const token = await getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/uploads/event-image`, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Upload failed");
      }
      return res.json();
    },
    // Confirm presigned upload completed
    confirmProfilePicture: (publicUrl: string) =>
      apiFetch("/uploads/confirm-profile-picture", {
        method: "POST",
        body: JSON.stringify({ publicUrl }),
      }),
  },
  reports: {
    create: (payload: {
      targetUserId?: string;
      targetEventId?: string;
      targetMessageId?: string;
      reason: string;
      details?: string;
    }) =>
      apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  blocks: {
    list: () => apiFetch("/blocks"),
    block: (userId: string) => apiFetch(`/blocks/${userId}`, { method: "POST" }),
    unblock: (userId: string) => apiFetch(`/blocks/${userId}`, { method: "DELETE" }),
  },
};

export default api;
export { API_BASE };
