'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface IncomingEmail {
  id: string;
  message_id: string;
  from_email: string;
  from_name?: string;
  to_email: string;
  subject: string;
  plain_text?: string;
  html_content?: string;
  received_at: string;
  is_read: boolean;
  is_archived: boolean;
  is_spam: boolean;
  priority: string;
  attachments: any[];
  assigned_to?: string;
  notes?: string;
  forwarded_to?: string[];
  forwarded_at?: string;
  auto_replied: boolean;
}

export default function MailInboxPage() {
  const [emails, setEmails] = useState<IncomingEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<IncomingEmail | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived' | 'spam'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmails();
  }, [filter]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('incoming_emails')
        .select('*')
        .order('received_at', { ascending: false });

      // Apply filters
      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'archived') {
        query = query.eq('is_archived', true);
      } else if (filter === 'spam') {
        query = query.eq('is_spam', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId: string, read: boolean) => {
    try {
      const { error } = await supabase
        .from('incoming_emails')
        .update({ is_read: read })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(emails.map(email =>
        email.id === emailId ? { ...email, is_read: read } : email
      ));

      if (selectedEmail?.id === emailId) {
        setSelectedEmail({ ...selectedEmail, is_read: read });
      }
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const archiveEmail = async (emailId: string, archived: boolean) => {
    try {
      const { error } = await supabase
        .from('incoming_emails')
        .update({ is_archived: archived })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(emails.filter(email => email.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error archiving email:', error);
    }
  };

  const markAsSpam = async (emailId: string, spam: boolean) => {
    try {
      const { error } = await supabase
        .from('incoming_emails')
        .update({ is_spam: spam })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(emails.filter(email => email.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Error marking email as spam:', error);
    }
  };

  const filteredEmails = emails.filter(email => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      email.subject.toLowerCase().includes(searchLower) ||
      email.from_email.toLowerCase().includes(searchLower) ||
      (email.from_name && email.from_name.toLowerCase().includes(searchLower)) ||
      (email.plain_text && email.plain_text.toLowerCase().includes(searchLower))
    );
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Email List Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Mail Inbox</h1>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="mt-4 flex space-x-2">
            {[
              { key: 'all', label: 'All', count: emails.length },
              { key: 'unread', label: 'Unread', count: emails.filter(e => !e.is_read).length },
              { key: 'archived', label: 'Archived', count: emails.filter(e => e.is_archived).length },
              { key: 'spam', label: 'Spam', count: emails.filter(e => e.is_spam).length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === key
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading emails...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No emails found</div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  if (!email.is_read) {
                    markAsRead(email.id, true);
                  }
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                } ${!email.is_read ? 'bg-white' : 'bg-gray-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium truncate ${
                        !email.is_read ? 'text-gray-900 font-semibold' : 'text-gray-700'
                      }`}>
                        {email.from_name || email.from_email}
                      </p>
                      {!email.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className={`text-sm truncate mt-1 ${
                      !email.is_read ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {email.plain_text?.substring(0, 100) || 'No preview available'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(email.priority)}`}>
                      {email.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Detail View */}
      <div className="flex-1 bg-white flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      <strong>From:</strong> {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                    </span>
                    <span>
                      <strong>To:</strong> {selectedEmail.to_email}
                    </span>
                    <span>
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAsRead(selectedEmail.id, !selectedEmail.is_read)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Mark as {selectedEmail.is_read ? 'Unread' : 'Read'}
                  </button>
                  <button
                    onClick={() => archiveEmail(selectedEmail.id, !selectedEmail.is_archived)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    {selectedEmail.is_archived ? 'Unarchive' : 'Archive'}
                  </button>
                  <button
                    onClick={() => markAsSpam(selectedEmail.id, !selectedEmail.is_spam)}
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
                  >
                    Mark as Spam
                  </button>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedEmail.html_content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }}
                  className="prose max-w-none"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-gray-800">
                  {selectedEmail.plain_text || 'No content available'}
                </pre>
              )}

              {/* Attachments */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {selectedEmail.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-gray-700">{attachment.filename}</span>
                        <span className="text-xs text-gray-500">({attachment.size} bytes)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Metadata */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Email Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Message ID:</span> {selectedEmail.message_id}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedEmail.priority)}`}>
                      {selectedEmail.priority}
                    </span>
                  </div>
                  {selectedEmail.forwarded_to && selectedEmail.forwarded_to.length > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium">Forwarded to:</span> {selectedEmail.forwarded_to.join(', ')}
                    </div>
                  )}
                  {selectedEmail.auto_replied && (
                    <div className="col-span-2">
                      <span className="font-medium text-green-600">Auto-replied</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p>Select an email to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
