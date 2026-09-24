'use client';

import { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@/app/lib/definitions';

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState<Array<{id: string; username: string; image_url: string | null}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.data) setConversations(data.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${conversationId}`);
      const data = await res.json();
      if (data.data) setMessages(data.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConversation.id, content }),
      });

      if (res.ok) {
        const newMsg: Message = {
          id: crypto.randomUUID(),
          conversation_id: activeConversation.id,
          sender_id: 'current-user',
          content,
          read: true,
          created_at: new Date().toISOString(),
          sender_username: 'You',
          sender_image_url: null,
        };
        setMessages(prev => [...prev, newMsg]);
        setConversations(prev => prev.map(c => 
          c.id === activeConversation.id 
            ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
            : c
        ));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = async (otherUserId: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId }),
      });
      const data = await res.json();
      if (data.conversationId) {
        setShowNewChat(false);
        const conv = conversations.find(c => c.id === data.conversationId) || {
          id: data.conversationId,
          participant_a: '',
          participant_b: '',
          last_message: null,
          last_message_at: null,
          created_at: new Date().toISOString(),
          other_user_id: otherUserId,
        };
        setActiveConversation(conv);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=users`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error('Failed to search users:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(c => 
    c.other_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted">Loading...</div>;
  }

  return (
    <div className="flex h-full bg-surface rounded-xl overflow-hidden border border-border">
      {/* Sidebar - Conversations List */}
      <aside className="w-80 md:w-96 border-r border-border flex flex-col bg-surface-strong">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-surface rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowNewChat(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {showNewChat && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">New Message</h3>
              <button onClick={() => setShowNewChat(false)} className="text-muted hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); searchUsers(); }}
              className="w-full px-3 py-2 bg-surface rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 max-h-40 overflow-y-auto">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleNewConversation(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-tertiary rounded-lg transition-colors"
                >
                  <img 
                    src={user.image_url || `https://i.pravatar.cc/150?u=${user.id}`} 
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{user.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Click + to start a new chat</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-surface-tertiary transition-colors ${
                  activeConversation?.id === conv.id ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="relative">
                  <img 
                    src={conv.other_image_url || `https://i.pravatar.cc/150?u=${conv.other_user_id}`} 
                    alt={conv.other_username || 'User'}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {conv.unread_count && conv.unread_count > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{conv.other_username || 'Unknown User'}</h4>
                    {conv.last_message_at && (
                      <span className="text-xs text-muted whitespace-nowrap ml-2">
                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted truncate">
                    {conv.last_message || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <>
            <header className="px-4 py-3 border-b border-border bg-surface-strong flex items-center gap-3">
              <img 
                src={activeConversation.other_image_url || `https://i.pravatar.cc/150?u=${activeConversation.other_user_id}`} 
                alt={activeConversation.other_username || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">{activeConversation.other_username || 'Unknown User'}</h3>
                <p className="text-xs text-muted">Online</p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted">
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        msg.sender_id === 'current-user'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-surface-tertiary text-foreground rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === 'current-user' ? 'text-blue-100' : 'text-muted'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-surface-strong">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-surface rounded-full border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-surface">
            <div className="text-center text-muted">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Select a conversation</h3>
              <p className="text-sm">Or start a new one by clicking +</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}