/**
 * API client for Teams RAG Chat Application
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Chat functionality
  async sendChatQuery(query, options = {}) {
    const payload = {
      query,
      limit: options.limit || 5,
      include_context: options.includeContext !== false,
      chat_filter: options.chatFilter,
    };

    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Data ingestion
  async ingestChatFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    if (options.chunkSize) {
      formData.append('chunk_size', options.chunkSize.toString());
    }

    return fetch(`${this.baseUrl}/ingest`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    });
  }

  // Conversation management
  async getConversations() {
    return this.request('/conversations');
  }

  async deleteConversation(conversationId) {
    return this.request(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  // Database management
  async getStats() {
    return this.request('/stats');
  }

  async optimizeIndex() {
    return this.request('/optimize', {
      method: 'POST',
    });
  }
}

// Create and export a default instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient };