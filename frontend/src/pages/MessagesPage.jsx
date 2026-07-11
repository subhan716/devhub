import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Info, Check, CheckCheck, MessageSquare, Image as ImageIcon, Paperclip, Smile, Loader2, X, FileText, Download } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

const MessagesPage = () => {
  const { currentUser } = useOutletContext();
  const { socket, onlineUsers } = useSocket() || {};
  
  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'Focused';

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

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

  // Fetch Conversations and Connections
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convosRes, connsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/messages/conversations', { withCredentials: true }),
          currentUser?._id ? axios.get(`http://localhost:5000/api/network/connections/${currentUser._id}`, { withCredentials: true }) : Promise.resolve({ data: [] })
        ]);
        setConversations(convosRes.data);
        setConnections(connsRes.data);
      } catch (error) {
        console.error('Failed to fetch conversations or connections', error);
      } finally {
        setIsLoadingConvos(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedChat && conversations.length > 0) {
      setSelectedChat(conversations[0].user);
    }
  }, [conversations, selectedChat]);

  // Fetch Messages for selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      setIsLoadingMessages(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/messages/${selectedChat._id}`, { withCredentials: true });
        setMessages(data);
        // Mark as read
        await axios.put(`http://localhost:5000/api/messages/${selectedChat._id}/read`, {}, { withCredentials: true });
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (message) => {
      // Check if message belongs to the currently selected active chat
      const isFromActiveChat = selectedChat && (message.sender === selectedChat._id || message.sender._id === selectedChat._id);
      
      // If the message belongs to the currently selected chat, add it to the view
      if (isFromActiveChat) {
        setMessages(prev => [...prev, message]);
        // Optionally mark as read immediately if chat is open
        axios.put(`http://localhost:5000/api/messages/${selectedChat._id}/read`, {}, { withCredentials: true }).catch(e => console.error(e));
      } else {
        // Play notification sound if the message is from someone else
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio error:', e));
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

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachment(file);
    setShowEmojiPicker(false);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedChat || isUploading) return;

    try {
      setIsUploading(true);
      let attachmentData = null;

      if (attachment) {
        const formData = new FormData();
        formData.append('attachment', attachment);
        const { data } = await axios.post('http://localhost:5000/api/upload/chat-attachment', formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        attachmentData = data;
      }

      const { data: savedMessage } = await axios.post(
        `http://localhost:5000/api/messages/${selectedChat._id}`,
        { 
          text: newMessage,
          attachment: attachmentData
        },
        { withCredentials: true }
      );

      // Optimistically add to UI
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      setAttachment(null);
      setShowEmojiPicker(false);
      
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
    } finally {
      setIsUploading(false);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.includes(userId);
  };

  return (
    <>
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
        <div data-lenis-prevent="true" className={`flex-1 overflow-y-auto custom-scrollbar min-h-0 ${conversations.length === 0 && connections.length === 0 && !isLoadingConvos ? 'flex flex-col items-center justify-center' : ''}`}>
          {isLoadingConvos ? (
            // Skeleton Loader
            <div className="flex flex-col">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded-full animate-pulse w-2/3" />
                    <div className="h-2.5 bg-white/5 rounded-full animate-pulse w-1/2" />
                  </div>
                  <div className="w-8 h-2 bg-white/5 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {conversations.length === 0 && connections.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-gray-500 p-6 text-center">
                <MessageSquare size={40} className="mb-4 opacity-30" />
                <p className="text-sm">No conversations yet.</p>
              </motion.div>
            ) : (
              <>
                {/* Conversations List */}
                {conversations.map((chat, idx) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    key={chat.user._id}
                    onClick={() => setSelectedChat(chat.user)}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors border-b border-white/5 group ${
                      selectedChat?._id === chat.user._id 
                        ? 'bg-white/5 border-l-4 border-l-[#00F0FF]' 
                        : 'hover:bg-white/5 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img 
                        src={chat.user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                        alt={chat.user.name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {isUserOnline(chat.user._id) && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#111] rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="font-semibold text-sm text-gray-100 truncate">
                          {chat.user.name}
                        </h3>
                        {chat.latestMessage && (
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {format(new Date(chat.latestMessage.createdAt), 'MMM d')}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate ${
                        chat.latestMessage?.receiver === currentUser?._id && !chat.latestMessage?.read 
                          ? 'text-white font-semibold' 
                          : 'text-gray-400'
                      }`}>
                        {chat.latestMessage?.sender === currentUser?._id ? 'You: ' : ''}
                        {chat.latestMessage?.text || 'Started a conversation'}
                      </p>
                    </div>
                    
                    {/* Unread Badge */}
                    {chat.latestMessage?.receiver === currentUser?._id && !chat.latestMessage?.read && (
                      <div className="w-2.5 h-2.5 bg-[#00F0FF] rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </motion.div>
                ))}

                {/* Connections without existing conversations */}
                {connections.filter(conn => !conversations.some(conv => conv.user._id === conn.user._id)).map((conn, idx) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (conversations.length + idx) * 0.03 }}
                    key={`conn-${conn.user._id}`}
                    onClick={() => setSelectedChat(conn.user)}
                    className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors border-b border-white/5 group ${
                      selectedChat?._id === conn.user._id 
                        ? 'bg-white/5 border-l-4 border-l-[#00F0FF]' 
                        : 'hover:bg-white/5 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img 
                        src={conn.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                        alt={conn.user?.name} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {isUserOnline(conn.user._id) && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#111] rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center h-12">
                      <h3 className="font-semibold text-sm text-gray-100 truncate">
                        {conn.user?.name}
                      </h3>
                      <p className="text-sm text-gray-500 italic truncate mt-0.5">
                        Start a conversation
                      </p>
                    </div>
                  </motion.div>
                ))}
              </>
            )
            }
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Right Content - Chat Window */}
      <div className={`flex-1 flex flex-col bg-transparent min-h-0 overflow-hidden ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        
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
            <div data-lenis-prevent="true" className="flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col gap-5 relative bg-[url('/grid.svg')] bg-[length:30px_30px] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] p-6">
              {isLoadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#00F0FF]" />
                    <span className="text-sm text-gray-500">Loading messages...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-auto" />
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

                          {/* Image-only message: no bubble, just the image */}
                          {msg.attachment?.type === 'image' && !msg.text ? (
                            <div className="max-w-[280px] relative group">
                              <img
                                src={msg.attachment.url}
                                alt="attachment"
                                className="w-full rounded-2xl object-cover shadow-lg cursor-zoom-in hover:opacity-95 transition-opacity"
                                onClick={() => setPreviewImage(msg.attachment.url)}
                              />
                              {isMe && (
                                <div className="flex justify-end mt-1.5">
                                  {msg.read ? <CheckCheck size={14} className="text-white/60" /> : <Check size={14} className="text-white/40" />}
                                </div>
                              )}
                            </div>
                          ) : (
                          <div 
                            className={`max-w-[70%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-lg relative ${
                              isMe 
                                ? 'bg-[#0055FF] text-white font-medium rounded-br-sm' 
                                : 'bg-[#1a1a1a] border border-white/10 text-gray-200 rounded-bl-sm backdrop-blur-sm'
                            }`}
                          >
                            {msg.attachment && (
                              <div className="mb-2">
                                {msg.attachment.type === 'image' ? (
                                  <img src={msg.attachment.url} alt="attachment" className="max-w-full rounded-xl object-contain" />
                                ) : (
                                  <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/10 hover:bg-black/40 transition-colors">
                                    <FileText size={24} className="text-[#00F0FF]" />
                                    <span className="text-sm font-medium truncate max-w-[150px]">{msg.attachment.name}</span>
                                    <Download size={16} className="text-gray-400 ml-2" />
                                  </a>
                                )}
                              </div>
                            )}
                            {msg.text && <div>{msg.text}</div>}
                            {/* Read Receipts */}
                            {isMe && (
                              <div className="flex justify-end mt-1.5 opacity-80">
                                {msg.read ? <CheckCheck size={14} className="text-white" /> : <Check size={14} className="text-white/60" />}
                              </div>
                            )}
                          </div>
                          )}
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
                </>
              )}
            </div>

            {/* Message Input Form */}
            <div className="p-4 border-t border-white/5 bg-[#111]/80 backdrop-blur-xl relative z-10 flex flex-col gap-3">
              
              {/* Attachment Preview */}
              {attachment && (
                <div className="mx-2 mb-1 p-3 bg-white/5 border border-white/10 rounded-xl relative flex items-center gap-3 w-fit">
                  <button type="button" onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors z-10">
                    <X size={14} className="text-white" />
                  </button>
                  {attachment.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(attachment)} alt="Preview" className="h-14 w-14 object-cover rounded-lg border border-white/10" />
                  ) : (
                    <div className="h-14 w-14 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center">
                      <FileText size={24} className="text-[#00F0FF]" />
                    </div>
                  )}
                  <span className="text-sm text-gray-300 truncate max-w-[150px] font-medium">{attachment.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2 px-2 relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  accept="image/*,.pdf,.doc,.docx,.zip,.txt"
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Attach File/Image">
                  <Paperclip size={20} />
                </button>
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Emoji">
                  <Smile size={20} />
                </button>
                
                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 z-50 shadow-2xl">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                  </div>
                )}
              </div>
              <form 
                onSubmit={handleSendMessage}
                className="flex items-end gap-3 bg-black/40 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-[#0055FF]/50 focus-within:bg-[#111] transition-all duration-300 shadow-inner"
              >
                <textarea 
                  value={newMessage}
                  onChange={handleTypingInput}
                  data-lenis-prevent="true"
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
                  disabled={(typeof newMessage === 'string' ? !newMessage.trim() : true) && !attachment || isUploading}
                  className="bg-[#0055FF] text-white p-2.5 mb-1 rounded-full hover:bg-[#0044CC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,85,255,0.4)] disabled:shadow-none"
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin ml-0.5" /> : <Send size={18} className="ml-0.5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>

    {/* Image Lightbox Preview Modal */}
    <AnimatePresence>
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          {/* Close Button */}
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-white/10 z-10"
          >
            <X size={20} />
          </button>

          {/* Download Button */}
          <a
            href={previewImage}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-16 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-white/10 z-10"
          >
            <Download size={20} />
          </a>

          {/* Image */}
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl border border-white/10"
          />
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default MessagesPage;
