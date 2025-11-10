import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SendIcon, BotIcon, UserIcon, Loader2Icon, ArrowLeftIcon, SproutIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function HistoryChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessionInfo();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessionInfo = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSessionInfo(data);
      }
    } catch (err) {
      console.error('Error fetching session info:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const userUid = localStorage.getItem('piliseed_user_uid');
      
      const response = await fetch(
        `${API_BASE_URL}/recommendations/session/${sessionId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userMessage.content,
            user_uid: userUid
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.detail || 'Failed to get response');
      }
      
      if (data.error) {
        const errorMessageId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const errorMessage: Message = {
          id: errorMessageId,
          role: 'assistant',
          content: data.message || 'Sorry, I encountered an error.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const assistantMessageId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessageId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const errorMessage: Message = {
        id: errorMessageId,
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col pb-28">
      <div className="bg-green-600 px-5 pt-12 pb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/history/${sessionId}`)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </motion.button>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <BotIcon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">PiliSeed AI</h1>
            <p className="text-white/90 text-sm">Session Assistant</p>
          </div>
        </div>

        {sessionInfo && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <SproutIcon className="w-4 h-4 text-white/90" />
              <span className="text-white/90 text-xs font-medium">Session Data</span>
            </div>
            <p className="text-white text-sm">
              {sessionInfo.location || 'Unknown Location'} • {sessionInfo.recommendations?.length || 0} crops
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-32 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BotIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start a Conversation
            </h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              Ask me anything about the crops and recommendations in this session!
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-green-600' 
                  : 'bg-white shadow-md'
              }`}>
                {msg.role === 'user' ? (
                  <UserIcon className="w-5 h-5 text-white" />
                ) : (
                  <BotIcon className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className={`flex-1 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white shadow-md text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-white shadow-md rounded-2xl flex items-center justify-center">
              <BotIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 max-w-[75%]">
              <div className="px-4 py-3 bg-white shadow-md rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2Icon className="w-4 h-4 text-green-600 animate-spin" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 pb-28 pt-4 px-5" style={{ maxWidth: '430px', margin: '0 auto' }}>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about these crops..."
              rows={1}
              className="w-full px-4 py-3 bg-green-50 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-600 resize-none text-gray-900 placeholder-gray-500 scrollbar-hide"
              style={{ maxHeight: '120px', minHeight: '48px' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="w-12 h-12 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <SendIcon className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
