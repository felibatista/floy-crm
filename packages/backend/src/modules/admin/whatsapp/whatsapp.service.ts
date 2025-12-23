export class WhatsAppService {
  private getGowaUrl(): string {
    return process.env.GOWA_API_URL || "http://localhost:3000";
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add basic auth if configured via GOWA_BASIC_AUTH env var (format: user:pass)
    const basicAuth = process.env.GOWA_BASIC_AUTH;
    if (basicAuth) {
      const auth = Buffer.from(basicAuth).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = this.getGowaUrl();
    const headers = this.getHeaders();

    console.log(`[WhatsApp] Requesting ${baseUrl}${endpoint}`);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const text = await response.text();
      console.log(
        `[WhatsApp] Response status: ${response.status}, body: ${text.substring(
          0,
          500
        )}`
      );

      if (!response.ok) {
        throw new Error(text || `HTTP ${response.status}`);
      }

      // Parse JSON
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
      }
    } catch (error: any) {
      console.error(`[WhatsApp] Error:`, error.message);
      throw error;
    }
  }

  // Connection & Auth
  async login() {
    return this.request("/app/login");
  }

  async loginWithCode(phone: string) {
    return this.request(
      `/app/login-with-code?phone=${encodeURIComponent(phone)}`
    );
  }

  async logout() {
    return this.request("/app/logout");
  }

  async reconnect() {
    return this.request("/app/reconnect");
  }

  async getDevices() {
    return this.request("/app/devices");
  }

  async getStatus() {
    try {
      const devices = (await this.getDevices()) as any;
      return {
        connected:
          Array.isArray(devices?.results) && devices.results.length > 0,
        devices: devices?.results || [],
      };
    } catch (error) {
      return { connected: false, devices: [] };
    }
  }

  // User info
  async getUserInfo(phone?: string) {
    const params = phone ? `?phone=${encodeURIComponent(phone)}` : "";
    return this.request(`/user/info${params}`);
  }

  async getUserAvatar(phone?: string, isPreview = true) {
    const params = new URLSearchParams();
    if (phone) params.set("phone", phone);
    params.set("is_preview", String(isPreview));
    return this.request(`/user/avatar?${params}`);
  }

  async getContacts() {
    return this.request("/user/my/contacts");
  }

  async getGroups() {
    return this.request("/user/my/groups");
  }

  // Chats
  async getChats(limit = 25, offset = 0, search?: string) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (search) params.set("search", search);

    const response: any = await this.request(`/chats?${params}`);

    // Enrich only the first 5 chats with their last message
    if (response?.results?.data && Array.isArray(response.results.data)) {
      const chats = response.results.data;
      const chatsToEnrich = chats.slice(0, 5);
      const remainingChats = chats.slice(5);

      // Fetch last message for first 5 chats in parallel
      const enrichedChats = await Promise.all(
        chatsToEnrich.map(async (chat: any) => {
          try {
            const messagesResponse: any = await this.getChatMessages(chat.jid, 1, 0);
            const messages = messagesResponse?.results?.data;

            if (messages && messages.length > 0) {
              const lastMessage = messages[0];
              return {
                ...chat,
                last_message: lastMessage.content || "(Archivo multimedia)",
              };
            }
          } catch (error) {
            console.error(`[WhatsApp] Error fetching last message for ${chat.jid}:`, error);
          }

          return chat;
        })
      );

      response.results.data = [...enrichedChats, ...remainingChats];
    }

    return response;
  }

  async getChatMessages(chatJid: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    // JID already comes decoded from Express, just use it directly
    return this.request(`/chat/${chatJid}/messages?${params}`);
  }

  // Send messages
  async sendMessage(phone: string, message: string, replyMessageId?: string) {
    return this.request("/send/message", {
      method: "POST",
      body: JSON.stringify({
        phone,
        message,
        reply_message_id: replyMessageId,
      }),
    });
  }

  async sendImage(phone: string, imageUrl: string, caption?: string) {
    return this.request("/send/image", {
      method: "POST",
      body: JSON.stringify({
        phone,
        image_url: imageUrl,
        caption,
      }),
    });
  }

  async sendFile(phone: string, fileUrl: string, caption?: string) {
    return this.request("/send/file", {
      method: "POST",
      body: JSON.stringify({
        phone,
        file_url: fileUrl,
        caption,
      }),
    });
  }

  // Message actions
  async readMessage(messageId: string, phone: string) {
    return this.request(`/message/${encodeURIComponent(messageId)}/read`, {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  async reactMessage(messageId: string, phone: string, emoji: string) {
    return this.request(`/message/${encodeURIComponent(messageId)}/reaction`, {
      method: "POST",
      body: JSON.stringify({ phone, emoji }),
    });
  }
}
