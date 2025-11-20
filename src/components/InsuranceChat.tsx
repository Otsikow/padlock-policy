
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AIService } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Policy = Tables<'policies'>;
type ChatMessage = Tables<'messages'>;
type Conversation = Tables<'conversations'>;

const InsuranceChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Tables<'conversations'>[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Tables<'conversations'> | null>(null);
  const [messages, setMessages] = useState<Tables<'messages'>[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadPolicies();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    const data = await AIService.getConversations(user.id);
    setConversations(data);
    
    if (data.length > 0 && !currentConversation) {
      setCurrentConversation(data[0]);
      loadMessages(data[0].id);
    }
  };

  const loadPolicies = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!error && data) {
      setPolicies(data);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const data = await AIService.getConversationMessages(conversationId);
    setMessages(data);
  };

  const createNewConversation = async () => {
    if (!user) return;
    
    const conversation = await AIService.createConversation(user.id, 'New Insurance Chat');
    if (conversation) {
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation || loading) return;

    setLoading(true);
    const userMessage = inputMessage;
    setInputMessage('');

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: 'temp-user',
      conversation_id: currentConversation.id,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await AIService.sendChatMessage(
        currentConversation.id,
        userMessage,
        policies
      );

      if (response) {
        // Reload messages to get the actual saved messages
        await loadMessages(currentConversation.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Sign in to chat</h3>
          <p className="text-gray-600">Please sign in to use the insurance chat assistant.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex gap-4">
      {/* Conversations Sidebar */}
      <div className="w-64 flex flex-col">
        <Button 
          onClick={createNewConversation}
          className="mb-4 bg-[#183B6B] hover:bg-[#1a3d6f]"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={currentConversation?.id === conv.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCurrentConversation(conv);
                  loadMessages(conv.id);
                }}
                className="w-full justify-start text-left h-auto py-2"
              >
                <div className="truncate">
                  {conv.title}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-[#183B6B] flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Insurance Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Ask me anything about your insurance coverage!</p>
                  <p className="text-sm mt-1">Try: "What does my car insurance cover?"</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-[#183B6B] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <div className="text-gray-600">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your insurance coverage..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                size="icon"
                className="bg-[#183B6B] hover:bg-[#1a3d6f]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceChat;
