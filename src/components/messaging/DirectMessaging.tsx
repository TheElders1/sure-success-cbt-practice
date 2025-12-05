import { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Mail } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  parent_id: string | null;
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
}

export default function DirectMessaging() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient_email: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  async function loadMessages() {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = new Set<string>();
      messagesData?.forEach((msg) => {
        userIds.add(msg.sender_id);
        userIds.add(msg.recipient_id);
      });

      const { data: usersData } = await supabase
        .from('users')
        .select('id, name')
        .in('id', Array.from(userIds));

      const userMap = new Map(usersData?.map((u) => [u.id, u.name]) || []);

      const messagesWithNames = messagesData?.map((msg) => ({
        ...msg,
        sender_name: userMap.get(msg.sender_id) || 'Unknown',
        recipient_name: userMap.get(msg.recipient_id) || 'Unknown',
      })) || [];

      setMessages(messagesWithNames);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!user || !newMessage.content.trim()) return;

    try {
      const { data: recipientData } = await supabase
        .from('users')
        .select('id')
        .eq('email', newMessage.recipient_email)
        .maybeSingle();

      if (!recipientData) {
        alert('User not found');
        return;
      }

      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        recipient_id: recipientData.id,
        subject: newMessage.subject || 'No Subject',
        content: newMessage.content,
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: recipientData.id,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${user.name}`,
        data: { sender_id: user.id },
      });

      setShowCompose(false);
      setNewMessage({ recipient_email: '', subject: '', content: '' });
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async function markAsRead(messageId: string) {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
      loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  async function deleteMessage(messageId: string) {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  function selectMessage(message: Message) {
    setSelectedMessage(message);
    if (!message.is_read && message.recipient_id === user?.id) {
      markAsRead(message.id);
    }
  }

  const unreadCount = messages.filter(
    (m) => !m.is_read && m.recipient_id === user?.id
  ).length;

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card variant="elevated" padding="lg" className="md:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-brand-primary" size={24} />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Messages</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {unreadCount} unread
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowCompose(!showCompose)}
          >
            Compose
          </Button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400 text-sm">
              No messages yet
            </div>
          ) : (
            messages.map((message) => {
              const isReceived = message.recipient_id === user?.id;
              const displayName = isReceived ? message.sender_name : message.recipient_name;

              return (
                <button
                  key={message.id}
                  onClick={() => selectMessage(message)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-brand-primary text-white'
                      : !message.is_read && isReceived
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold truncate">{displayName}</span>
                    {!message.is_read && isReceived && (
                      <Mail size={14} className="flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm font-medium truncate mb-1">{message.subject}</p>
                  <p className="text-xs opacity-75 truncate">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </Card>

      <Card variant="elevated" padding="lg" className="md:col-span-2">
        {showCompose ? (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Compose Message
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={newMessage.recipient_email}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, recipient_email: e.target.value })
                  }
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Message subject"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  placeholder="Write your message here..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="primary" onClick={sendMessage} className="gap-2 flex-1">
                  <Send size={16} />
                  Send Message
                </Button>
                <Button variant="secondary" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : selectedMessage ? (
          <div>
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedMessage.subject}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedMessage.recipient_id === user?.id ? 'From' : 'To'}:{' '}
                  {selectedMessage.recipient_id === user?.id
                    ? selectedMessage.sender_name
                    : selectedMessage.recipient_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => deleteMessage(selectedMessage.id)}
                className="gap-2"
              >
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedMessage.content}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-400">
            Select a message to read
          </div>
        )}
      </Card>
    </div>
  );
}
