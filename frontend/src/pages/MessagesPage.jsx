import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Info, Check, CheckCheck, MessageSquare, Image as ImageIcon, Paperclip, Smile } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { format } from 'date-fns';

const MessagesPage = () => {
  const { currentUser } = useOutletContext();
  const { socket, onlineUsers } = useSocket() || {};
  
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'Focused';

  const setActiveTab = (tab) => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    }, { replace: true });
  };
  
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/messages/conversations', { withCredentials: true });
        setConversations(data);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      }
    };
    fetchConversations();
  }, []);

  // Fetch Messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const { data } = await axios.get(`http://localhost:5000/api/messages/${selectedChat._id}`, { withCredentials: true });
        setMessages(data);
        
        // Mark as read
        await axios.put(`http://localhost:5000/api/messages/${selectedChat._id}/read`, {}, { withCredentials: true });
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (message) => {
      // If the message belongs to the currently selected chat, add it to the view
      if (selectedChat && (message.sender === selectedChat._id || message.sender._id === selectedChat._id)) {
        setMessages(prev => [...prev, message]);
        // Optionally mark as read immediately if chat is open
        axios.put(`http://localhost:5000/api/messages/${selectedChat._id}/read`, {}, { withCredentials: true }).catch(e => console.error(e));
      }
      
      // Update conversations list (latest message snippet)
      setConversations(prev => {
        const existingChatIndex = prev.findIndex(c => c.user._id === (message.sender._id || message.sender));
        let newConvos = [...prev];
        
        if (existingChatIndex !== -1) {
          const chat = newConvos[existingChatIndex];
          chat.latestMessage = message;
          newConvos.splice(existingChatIndex, 1);
          newConvos.unshift(chat); // Move to top
        } else {
          // If it's a completely new person, we might need to fetch conversations again
          // For simplicity, just reload the page or fetch conversations
          axios.get('http://localhost:5000/api/messages/conversations', { withCredentials: true })
            .then(res => setConversations(res.data))
            .catch(e => console.error(e));
        }
        return newConvos;
      });
    };

    const handleTyping = (senderId) => {
      if (selectedChat && senderId === selectedChat._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (senderId) => {
      if (selectedChat && senderId === selectedChat._id) {
        setIsTyping(false);
      }
    };

    socket.on('messageReceived', handleMessageReceived);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('messageReceived', handleMessageReceived);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, selectedChat]);

  // Handle typing input
  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedChat) {
      socket.emit('typing', { senderId: currentUser?._id, receiverId: selectedChat._id });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { senderId: currentUser?._id, receiverId: selectedChat._id });
      }, 2000);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const { data: savedMessage } = await axios.post(
        `http://localhost:5000/api/messages/${selectedChat._id}`,
        { text: newMessage },
        { withCredentials: true }
      );

      // Optimistically add to UI
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      
      // Emit via socket
      if (socket) {
        socket.emit('sendMessage', savedMessage);
        socket.emit('stopTyping', { senderId: currentUser?._id, receiverId: selectedChat._id });
      }

      // Update local conversations list to move this to the top
      setConversations(prev => {
        const existingChatIndex = prev.findIndex(c => c.user._id === selectedChat._id);
        if (existingChatIndex !== -1) {
          let newConvos = [...prev];
          const chat = newConvos[existingChatIndex];
          chat.latestMessage = savedMessage;
          newConvos.splice(existingChatIndex, 1);
          newConvos.unshift(chat);
          return newConvos;
        }
        return prev;
      });

    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.includes(userId);
  };

  return (
    <div className="flex-1 flex bg-[#050505] overflow-hidden relative">
      
      {/* Left Sidebar - Conversations */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-white/5 flex flex-col bg-white/[0.02] ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 relative z-10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Messages</h2>
            <div className="p-2 bg-white/5 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <MessageSquare size={16} className="text-[#00F0FF]" />
            </div>
          </div>
          <div className="relative group mt-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00F0FF] transition-colors" />
              <input 
                type="text" 
                placeholder="Search messages" 
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#00F0FF]/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-[#111]/50">
          <button 
            onClick={() => setActiveTab('Focused')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'Focused' ? 'text-[#00F0FF] border-[#00F0FF]' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
          >
            Focused
          </button>
          <button 
            onClick={() => setActiveTab('Other')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'Other' ? 'text-[#00F0FF] border-[#00F0FF]' : 'text-gray-400 border-transparent hover:text-gray-200'}`}
          >
            Other
          </button>
        </div>

        {/* Conversation List */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${conversations.length === 0 ? 'flex flex-col items-center justify-center' : ''}`}>
          <AnimatePresence>
            {conversations.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-gray-500 p-6 text-center">
                <MessageSquare size={40} className="mb-4 opacity-30" />
                <p className="text-sm">No conversations yet.</p>
              </motion.div>
            ) : (
              conversations.map((chat, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={chat.user._id}
                  onClick={() => setSelectedChat(chat.user)}
                  className={`p-5 flex items-center gap-4 cursor-pointer transition-all border-b border-white/5 relative overflow-hidden group ${
                    selectedChat?._id === chat.user._id 
                      ? 'bg-gradient-to-r from-[#00F0FF]/10 to-transparent border-l-2 border-l-[#00F0FF]' 
                      : 'hover:bg-white/5 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={chat.user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                      alt={chat.user.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-[#00F0FF]/50 transition-colors bg-[#111]"
                    />
                    {isUserOnline(chat.user._id) && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00F0FF] border-2 border-black rounded-full shadow-[0_0_10px_rgba(0,240,255,0.6)]"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-bold text-[15px] truncate transition-colors ${selectedChat?._id === chat.user._id ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                        {chat.user.name}
                      </h3>
                      {chat.latestMessage && (
                        <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap ml-2">
                          {format(new Date(chat.latestMessage.createdAt), 'h:mm a')}
                        </span>
                      )}
                    </div>
                    <p className={`text-[13px] truncate ${
                      chat.latestMessage?.receiver === currentUser?._id && !chat.latestMessage?.read 
                        ? 'text-white font-semibold' 
                        : 'text-gray-400'
                    }`}>
                      {chat.latestMessage?.text || 'Started a conversation'}
                    </p>
                  </div>
                  
                  {/* Unread Badge */}
                  {chat.latestMessage?.receiver === currentUser?._id && !chat.latestMessage?.read && (
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-[#00F0FF] to-[#8A2BE2] rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Content - Chat Window */}
      <div className={`flex-1 flex flex-col bg-transparent ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        
        {!selectedChat ? (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-[#00F0FF]/10 to-[#8A2BE2]/10 rounded-full flex items-center justify-center mb-8 mx-auto border border-white/5 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                <Send size={44} className="text-[#00F0FF] opacity-90 ml-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Your Workspace</h2>
              <p className="max-w-md text-gray-400 leading-relaxed">Select a conversation from the sidebar or navigate to a developer's profile to start networking.</p>
            </motion.div>
          </div>
        ) : (
          // Active Chat
          <>
            {/* Chat Header */}
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] backdrop-blur-md flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <button 
                  className="md:hidden p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setSelectedChat(null)}
                >
                  ←
                </button>
                <div className="relative cursor-pointer">
                  <img 
                    src={selectedChat.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                    alt={selectedChat.name} 
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                  {isUserOnline(selectedChat._id) && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00F0FF] border-2 border-[#111] rounded-full shadow-[0_0_8px_rgba(0,240,255,0.5)]"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-[17px] leading-tight cursor-pointer hover:text-[#00F0FF] transition-colors">{selectedChat.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${isUserOnline(selectedChat._id) ? 'bg-[#00F0FF] shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'bg-gray-500'}`}></span>
                    <span className="text-[12px] font-medium text-gray-400">
                      {isUserOnline(selectedChat._id) ? 'Active now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                <Info size={20} />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5 relative bg-[url('/grid.svg')] bg-[length:30px_30px] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
              <div className="mt-auto"></div>
              
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-gray-400">
                    <div className="inline-block p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                      <MessageSquare size={32} className="text-gray-500" />
                    </div>
                    <p className="text-sm">Say hi to {selectedChat.name}! 👋</p>
                  </motion.div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id;
                    
                    const showTime = index === 0 || 
                      (new Date(msg.createdAt).getTime() - new Date(messages[index-1].createdAt).getTime() > 10 * 60 * 1000);
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        key={msg._id} 
                        className="flex flex-col"
                      >
                        {showTime && (
                          <div className="flex items-center justify-center my-4">
                            <div className="h-px bg-white/5 flex-1 mx-4"></div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold bg-[#0a0a0a] px-3 py-1 rounded-full border border-white/5">
                              {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                            </span>
                            <div className="h-px bg-white/5 flex-1 mx-4"></div>
                          </div>
                        )}
                        
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-3`}>
                          
                          {/* Avatar for receiver */}
                          {!isMe && (
                            <img 
                              src={selectedChat.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                              alt={selectedChat.name}
                              className="w-8 h-8 rounded-full object-cover mr-3 self-end shadow-md border border-white/5"
                            />
                          )}

                          <div 
                            className={`max-w-[70%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-lg relative ${
                              isMe 
                                ? 'bg-[#0055FF] text-white font-medium rounded-br-sm' 
                                : 'bg-[#1a1a1a] border border-white/10 text-gray-200 rounded-bl-sm backdrop-blur-sm'
                            }`}
                          >
                            {msg.text}
                            
                            {/* Read Receipts */}
                            {isMe && (
                              <div className="flex justify-end mt-1.5 opacity-80">
                                {msg.read ? <CheckCheck size={14} className="text-white" /> : <Check size={14} className="text-white/60" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-start mb-1"
                  >
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-2 h-2 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <div className="p-4 border-t border-white/5 bg-[#111]/80 backdrop-blur-xl relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Attach Image">
                  <ImageIcon size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Attach File">
                  <Paperclip size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Emoji">
                  <Smile size={20} />
                </button>
              </div>
              <form 
                onSubmit={handleSendMessage}
                className="flex items-end gap-3 bg-black/40 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-[#0055FF]/50 focus-within:bg-[#111] transition-all duration-300 shadow-inner"
              >
                <textarea 
                  value={newMessage}
                  onChange={handleTypingInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 px-2 py-2 text-[15px] resize-none max-h-32 custom-scrollbar min-h-[44px]"
                  rows={1}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-[#0055FF] text-white p-2.5 mb-1 rounded-full hover:bg-[#0044CC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,85,255,0.4)] disabled:shadow-none"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
