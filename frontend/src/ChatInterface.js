import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load available conversations on mount
    loadConversations();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          chat_filter: selectedConversation || undefined,
          limit: 5,
          include_context: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        retrieved_chunks: data.retrieved_chunks || [],
        processing_time: data.processing_time,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Chat request failed:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const systemMessage = {
        id: Date.now(),
        type: 'system',
        content: `Successfully ingested "${file.name}": ${data.chunks_created} chunks created, ${data.vectors_stored} vectors stored.`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, systemMessage]);

      // Reload conversations
      loadConversations();

    } catch (error) {
      console.error('File upload failed:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: `Failed to upload file: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>Conversations</h3>
          <button
            className="upload-button"
            onClick={() => document.getElementById('file-upload').click()}
            disabled={isLoading}
          >
            Upload Chat
          </button>
          <input
            id="file-upload"
            type="file"
            accept=".md"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        <div className="conversation-list">
          {conversations.length === 0 ? (
            <p className="no-conversations">No conversations uploaded yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.title}
                className={`conversation-item ${selectedConversation === conv.title ? 'selected' : ''}`}
                onClick={() => setSelectedConversation(conv.title)}
              >
                <h4>{conv.title}</h4>
                <span>{conv.message_count} messages</span>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button className="clear-button" onClick={clearChat}>
            Clear Chat
          </button>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>Welcome to Teams RAG Chat!</h2>
              <p>Upload a Teams chat export (Markdown file) and start asking questions about your conversations.</p>
              <div className="example-queries">
                <p>Example queries:</p>
                <ul>
                  <li>"What did we discuss about the project deadline?"</li>
                  <li>"Find messages from John about the budget"</li>
                  <li>"Summarize the team's feedback on the new feature"</li>
                </ul>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-header">
                  <span className="message-type">{message.type === 'user' ? 'You' : message.type === 'ai' ? 'AI Assistant' : 'System'}</span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">
                  {message.content}
                  {message.processing_time && (
                    <div className="processing-time">
                      Processed in {message.processing_time.toFixed(2)}s
                    </div>
                  )}
                  {message.retrieved_chunks && message.retrieved_chunks.length > 0 && (
                    <div className="retrieved-chunks">
                      <details>
                        <summary>Sources ({message.retrieved_chunks.length})</summary>
                        {message.retrieved_chunks.map((chunk, idx) => (
                          <div key={idx} className="chunk-preview">
                            <strong>{chunk.chunk.metadata.chat_title}</strong>
                            <p>{chunk.chunk.text.substring(0, 100)}...</p>
                            <small>Score: {chunk.score.toFixed(3)}</small>
                          </div>
                        ))}
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="message ai loading">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about your Teams conversations..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;