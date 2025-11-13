'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, User, Bot, Calendar, Info, RefreshCw, Search } from 'lucide-react';

interface Message {
  id: string;
  session_id: string;
  customer_email: string | null;
  customer_name: string | null;
  message: string;
  sender: 'user' | 'bot';
  visitor_info: any;
  created_at: string;
}

interface ConversationSession {
  sessionId: string;
  messages: Message[];
  lastMessage: Message;
  messageCount: number;
  visitorInfo: any;
}

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/chat');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      session.sessionId.toLowerCase().includes(search) ||
      session.messages.some(msg => msg.message.toLowerCase().includes(search)) ||
      (session.visitorInfo && JSON.stringify(session.visitorInfo).toLowerCase().includes(search))
    );
  });

  const selectedConversation = selectedSession 
    ? sessions.find(s => s.sessionId === selectedSession)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-8 h-8" />
              Chat Conversations
            </h1>
            <p className="text-gray-600 mt-1">View and manage chatbot conversations</p>
          </div>
          <button
            onClick={fetchConversations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Loading conversations...
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <button
                    key={session.sessionId}
                    onClick={() => setSelectedSession(session.sessionId)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedSession === session.sessionId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {session.messages[0]?.customer_email || `Visitor #${session.sessionId.slice(-6)}`}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {session.lastMessage.message.substring(0, 50)}
                          {session.lastMessage.message.length > 50 ? '...' : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.lastMessage.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {session.messageCount} messages
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-blue-600">
                    📧 {selectedConversation.messages[0]?.customer_email || `Visitor #${selectedConversation.sessionId.slice(-6)}`}
                  </h2>
                  {selectedConversation.messages[0]?.customer_name && (
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedConversation.messages[0].customer_name}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedConversation.lastMessage.created_at).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {selectedConversation.messageCount} messages
                    </span>
                  </div>
                  {selectedConversation.visitorInfo && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-blue-600 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        Visitor Information
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(selectedConversation.visitorInfo, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-350px)] space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'user' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Bot className="w-4 h-4" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === 'user' ? 'User' : 'Bot'}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a conversation to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.reduce((acc, s) => acc + s.messageCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Messages</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.length > 0
                    ? Math.round(sessions.reduce((acc, s) => acc + s.messageCount, 0) / sessions.length)
                    : 0}
                </p>
                <p className="text-sm text-gray-600">Avg Messages/Session</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
