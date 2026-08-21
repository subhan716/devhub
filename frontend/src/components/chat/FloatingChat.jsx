import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Minus, ChevronUp, ChevronDown, Send, Image as ImageIcon, Paperclip, Smile, MoreHorizontal, Search, FileText, Download, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import EmojiPicker from 'emoji-picker-react';
import { ChatListSkeleton } from '../common/Skeletons';

const FloatingChat = ({ currentUser }) => {
  const { socket, onlineUsers } = useSocket() || {};
  const location = useLocation();
  const { isDark } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [connections, setConnections] = useState([]);
  
  // Settings
  const [muteSounds, setMuteSounds] = useState(() => localStorage.getItem('muteMessageSounds') === 'true');
  const [readReceipts, setReadReceipts] = useState(() => localStorage.getItem('disableReadReceipts') !== 'true'); // default true
  const [activeChats, setActiveChats] = useState([]); // Array of chat objects, max 3
  const [chatMessages, setChatMessages] = useState({}); // { chatId: [messages] }
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('focused'); // 'focused' or 'other'
  const optionsRef = useRef(null);

  // Click outside listener for options menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setIsOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && conversations.length === 0 && !isLoading) {
      const fetchConversations = async () => {
        setIsLoading(true);
        try {
          const [convosRes, connsRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations`, { withCredentials: true }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/network/connections/${currentUser?._id}`, { withCredentials: true })
          ]);
          setConversations(convosRes.data);
          setConnections(connsRes.data);
        } catch (error) {
          console.error('Failed to fetch data', error);
        }
      };
      fetchConversations().finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  // Socket listener for global new messages
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (message) => {
      // Update chat messages if this chat is open
      const senderId = message.sender._id || message.sender;
      if (activeChats.find(c => c._id === senderId)) {
        setChatMessages(prev => ({
          ...prev,
          [senderId]: [...(prev[senderId] || []), message]
        }));
      }
      
      // Also update conversations list even if drawer is not open
      setConversations(prev => {
        const existing = prev.findIndex(c => c.user._id === senderId);
        let newConvos = [...prev];
        if (existing !== -1) {
          newConvos[existing] = { ...newConvos[existing], latestMessage: message };
          const chat = newConvos.splice(existing, 1)[0];
          newConvos.unshift(chat);
        } else {
          // Could refetch here, but for now just relying on opening the drawer to fetch if empty
        }
        return newConvos;
      });

      // Play sound if not muted and message is from someone not currently open in a chat head, and not on /messages page
      const isActiveChat = activeChats.some(c => c._id === senderId);
      const isMessagesPage = location.pathname.startsWith('/messages');
      
      if (!muteSounds && !isActiveChat && !isMessagesPage) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio error:', e));
      }
    };
    const handleMessagesRead = ({ readerId }) => {
      if (activeChats.find(c => c._id === readerId)) {
        setChatMessages(prev => {
          const chatMsgs = prev[readerId] || [];
          const updatedMsgs = chatMsgs.map(msg => 
            ((msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id) && !msg.read) 
              ? { ...msg, read: true } 
              : msg
          );
          return { ...prev, [readerId]: updatedMsgs };
        });
      }
    };

    socket.on('messageReceived', handleMessage);
    socket.on('messagesRead', handleMessagesRead);
    return () => {
      socket.off('messageReceived', handleMessage);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, activeChats, isOpen, muteSounds, currentUser, location.pathname]);

  const openChatHead = async (user) => {
    if (!user || !user._id) return;
    // If already open, do nothing
    if (activeChats.find(c => c._id === user._id)) return;
    
    // Max 3 chat heads. Remove first (oldest) if adding 4th.
    let newChats = [...activeChats];
    if (newChats.length >= 3) {
      newChats.shift(); 
    }
    newChats.push(user);
    setActiveChats(newChats);

    setChatMessages(prev => ({ ...prev, [user._id]: prev[user._id] || [] }));

    // Fetch messages for this chat
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${user._id}`, { withCredentials: true });
      const msgs = Array.isArray(data) ? data : (Array.isArray(data?.messages) ? data.messages : []);
      setChatMessages(prev => ({ ...prev, [user._id]: msgs }));
    } catch (e) {
      console.error('Failed to load floating chat messages', e);
      setChatMessages(prev => ({ ...prev, [user._id]: [] }));
    }
  };

  const closeChatHead = (userId) => {
    setActiveChats(prev => prev.filter(c => c._id !== userId));
  };

  // Only show floating chat if NOT on /messages and if it hasn't been closed by the user
  if (location.pathname.startsWith('/messages') || !isVisible) return null;

  return (
    <div className="hidden md:flex fixed bottom-0 right-4 z-[999] items-end gap-3 pointer-events-none">
      
      {/* Active Chat Heads */}
      <AnimatePresence>
        {activeChats.map((chat) => (
          <ChatWindow 
            key={chat._id} 
            chat={chat} 
            messages={chatMessages[chat._id] || []}
            onClose={() => closeChatHead(chat._id)}
            currentUser={currentUser}
            socket={socket}
            onlineUsers={onlineUsers}
            setChatMessages={setChatMessages}
            setConversations={setConversations}
          />
        ))}
      </AnimatePresence>

      {/* Main Messaging Drawer */}
      <div className="w-[340px] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-t-xl shadow-2xl pointer-events-auto flex flex-col transition-all duration-300">
        
        {/* Drawer Header */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-3 ${isDark ? "bg-[#1a1a1a] text-white border-white/10" : "bg-white text-slate-900 border-slate-200 shadow-sm"} border-b flex justify-between items-center cursor-pointer rounded-t-xl transition-colors`}
        >
          <div className="flex items-center gap-2">
            <img 
              src={currentUser?.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              className="w-7 h-7 rounded-full border border-white/20" 
              alt="me"
            />
            <span className={`font-semibold text-[15px] ${isDark ? "text-white" : "text-slate-900"}`}>Messaging</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 relative" ref={optionsRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOptionsOpen(!isOptionsOpen); }} 
              className={`p-1.5 rounded transition-colors ${isOptionsOpen ? 'bg-white/10 text-white' : 'hover:bg-white/10'}`} 
              title="Options"
            >
              <MoreHorizontal size={16} />
            </button>
            
            {/* Options Dropdown */}
            <AnimatePresence>
              {isOptionsOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full right-0 mb-2 w-56 bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden origin-bottom-right"
                >
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-white/5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chat Settings</span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const newVal = !muteSounds;
                      setMuteSounds(newVal);
                      localStorage.setItem('muteMessageSounds', newVal);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors flex justify-between items-center"
                  >
                    <span>Mute Sounds</span>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${muteSounds ? 'bg-[#00F0FF]' : 'bg-gray-600'}`}>
                      <div className={`absolute top-0.5 bottom-0.5 w-3 h-3 bg-white rounded-full transition-transform ${muteSounds ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      const newVal = !readReceipts;
                      setReadReceipts(newVal);
                      localStorage.setItem('disableReadReceipts', !newVal);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors flex justify-between items-center"
                  >
                    <span>Read Receipts</span>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${readReceipts ? 'bg-[#00F0FF]' : 'bg-gray-600'}`}>
                      <div className={`absolute top-0.5 bottom-0.5 w-3 h-3 bg-white rounded-full transition-transform ${readReceipts ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                    </div>
                  </button>
                  
                  <div className="h-px bg-white/5 my-1"></div>
                  
                  <button 
                    onClick={() => {
                      setActiveChats([]);
                      setIsOptionsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#FF0055] hover:bg-white/5 transition-colors"
                  >
                    Close all active chats
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button className="hover:bg-white/10 p-1.5 rounded transition-colors">
              {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsVisible(false); }} 
              className="hover:bg-white/10 p-1.5 rounded transition-colors"
              title="Close Messages"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 450 }}
              exit={{ height: 0 }}
              data-lenis-prevent="true"
              className="bg-white dark:bg-[#111] overflow-y-auto custom-scrollbar flex flex-col min-h-0"
            >
              {/* Search Bar & Tabs */}
              <div className="p-3 border-b border-slate-200 dark:border-white/10">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search messages" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${isDark ? "bg-white/5 text-white border-white/10 placeholder:text-gray-500 focus:border-[#00F0FF]" : "bg-slate-100 text-slate-900 border-slate-200 placeholder:text-slate-400 focus:border-[#0A66C2]"} border rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none transition-colors`}
                  />
                </div>
                <div className="flex gap-6 px-1">
                  <button 
                    onClick={() => setActiveTab('focused')}
                    className={`text-sm font-semibold pb-2 px-1 transition-colors ${activeTab === 'focused' ? (isDark ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]' : 'text-[#0A66C2] border-b-2 border-[#0A66C2]') : (isDark ? 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
                  >
                    Focused
                  </button>
                  <button 
                    onClick={() => setActiveTab('other')}
                    className={`text-sm font-semibold pb-2 px-1 transition-colors ${activeTab === 'other' ? (isDark ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]' : 'text-[#0A66C2] border-b-2 border-[#0A66C2]') : (isDark ? 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
                  >
                    Other
                  </button>
                </div>
              </div>

              {/* Conversations & Connections List */}
              {isLoading ? (
                <div className="flex flex-col p-2">
                  <ChatListSkeleton />
                  <ChatListSkeleton />
                  <ChatListSkeleton />
                </div>
              ) : (() => {
                const query = searchQuery.trim().toLowerCase();
                
                // Filter conversations
                const filteredConvos = conversations.filter(conv => 
                  conv.user?.name?.toLowerCase().includes(query)
                );

                // Filter connections not in conversations
                const connectionsNotInConvos = connections.filter(conn => 
                  !conversations.some(conv => conv.user._id === conn.user._id)
                );
                const filteredConns = connectionsNotInConvos.filter(conn => 
                  conn.user?.name?.toLowerCase().includes(query)
                );

                const hasFocusedData = filteredConvos.length > 0;
                const hasOtherData = filteredConns.length > 0;

                if (activeTab === 'focused') {
                  if (!hasFocusedData) {
                    return (
                      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm py-10">
                        {query ? 'No matching conversations found.' : 'No conversations yet.'}
                      </div>
                    );
                  }
                  return filteredConvos.map(conv => (
                    <div 
                      key={conv.user._id}
                      onClick={() => openChatHead(conv.user)}
                      className="px-4 py-3 flex items-start gap-3 hover:bg-white/5 cursor-pointer border-b border-slate-200 dark:border-white/5 transition-colors animate-fadeIn"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={conv.user.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} className="w-12 h-12 rounded-full object-cover" alt="" />
                        {onlineUsers?.includes(conv.user._id) && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#111] rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-gray-100 truncate mb-0.5">{conv.user.name}</h4>
                        <p className="text-sm text-gray-400 truncate">{conv.latestMessage?.text}</p>
                      </div>
                    </div>
                  ));
                } else {
                  // Other Tab
                  if (!hasOtherData) {
                    return (
                      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm py-10">
                        {query ? 'No matching connections found.' : 'No other connections to message.'}
                      </div>
                    );
                  }
                  return filteredConns.map(conn => (
                    <div 
                      key={`conn-${conn.user._id}`}
                      onClick={() => openChatHead(conn.user)}
                      className="px-4 py-3 flex items-start gap-3 hover:bg-white/5 cursor-pointer border-b border-slate-200 dark:border-white/5 transition-colors animate-fadeIn"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={conn.user?.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} className="w-12 h-12 rounded-full object-cover" alt="" />
                        {onlineUsers?.includes(conn.user._id) && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#111] rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center h-12">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-gray-100 truncate">{conn.user?.name}</h4>
                        <p className="text-sm text-gray-500 italic truncate mt-0.5">Start a conversation</p>
                      </div>
                    </div>
                  ));
                }
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

// Sub-component for individual chat window
const ChatWindow = ({ chat, messages = [], onClose, currentUser, socket, onlineUsers, setChatMessages, setConversations }) => {
  const { isDark } = useTheme();
  if (!chat || !chat._id) return null;
  const safeMessages = Array.isArray(messages) ? messages : [];
  const [isMinimized, setIsMinimized] = useState(false);
  const [text, setText] = useState('');
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerContainerRef = useRef(null);
  
  const messagesEndRef = useRef(null);

  const prevMsgsLengthRef = useRef(0);

  useEffect(() => {
    if (!isMinimized) {
      if (messages.length > prevMsgsLengthRef.current || prevMsgsLengthRef.current === 0) {
        messagesEndRef.current?.scrollIntoView();
      }
      prevMsgsLengthRef.current = messages.length;
    }
  }, [messages, isMinimized]);

  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachment(file);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerContainerRef.current && !emojiPickerContainerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const send = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !attachment) || isUploading) return;
    
    try {
      const tempId = 'temp_' + Date.now();
      const currentText = text;
      const currentAttachment = attachment;

      const optimisticMsg = {
        _id: tempId,
        sender: currentUser,
        receiver: chat._id,
        text: currentText,
        attachment: currentAttachment ? { 
          url: URL.createObjectURL(currentAttachment), 
          type: currentAttachment.type.startsWith('image') ? 'image' : 'file', 
          name: currentAttachment.name 
        } : null,
        createdAt: new Date().toISOString(),
        read: false,
        pending: true
      };

      setChatMessages(prev => ({
        ...prev,
        [chat._id]: [...(prev[chat._id] || []), optimisticMsg]
      }));

      setText('');
      setAttachment(null);
      setShowEmojiPicker(false);
      setIsUploading(true);
      
      let attachmentData = null;

      if (currentAttachment) {
        const formData = new FormData();
        formData.append('attachment', currentAttachment);
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload/chat-attachment`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        attachmentData = data;
      }

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/${chat._id}`, { 
        text: currentText,
        attachment: attachmentData
      }, { withCredentials: true });
      
      setChatMessages(prev => ({
        ...prev,
        [chat._id]: (prev[chat._id] || []).map(m => m._id === tempId ? data : m)
      }));
      
      // Update conversations list with the new sent message
      if (setConversations) {
        setConversations(prev => {
          const existing = prev.findIndex(c => c.user._id === chat._id);
          let newConvos = [...prev];
          if (existing !== -1) {
            newConvos[existing] = { ...newConvos[existing], latestMessage: data };
            const conv = newConvos.splice(existing, 1)[0];
            newConvos.unshift(conv);
          } else {
            // If it's a completely new conversation from connections, add it
            newConvos.unshift({ user: chat, latestMessage: data });
          }
          return newConvos;
        });
      }

      setText('');
      setAttachment(null);
      setShowEmojiPicker(false);
      
      if (socket) socket.emit('sendMessage', data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="w-[420px] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-t-xl shadow-2xl pointer-events-auto flex flex-col"
    >
      {/* Chat Header */}
      <div 
        onClick={() => setIsMinimized(!isMinimized)}
        className={`px-3 py-2 ${isDark ? "bg-[#1a1a1a] text-white border-white/10" : "bg-white text-slate-900 border-slate-200 shadow-sm"} border-b flex justify-between items-center cursor-pointer rounded-t-xl transition-colors`}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src={chat.avatar?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} className="w-8 h-8 rounded-full object-cover" alt="" />
            {onlineUsers?.includes(chat._id) && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></div>
            )}
          </div>
          <span className="font-semibold text-sm truncate max-w-[150px]">{chat.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:bg-white/20 p-1 rounded transition-colors">
            {isMinimized ? <ChevronUp size={16} /> : <Minus size={16} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <div className={`h-[450px] flex flex-col ${isDark ? "bg-[#050505]" : "bg-white"}`}>
          <div data-lenis-prevent="true" className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 min-h-0">
            {safeMessages.map(msg => {
              if (!msg) return null;
              const isMe = msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {/* Image-only: no bubble wrapper */}
                  {msg.attachment?.type === 'image' && !msg.text ? (
                    <div className="max-w-[220px]">
                      <img
                        src={msg.attachment.url}
                        alt="attachment"
                        className="w-full rounded-2xl object-cover shadow-lg cursor-zoom-in hover:opacity-95 transition-opacity"
                        onClick={() => setPreviewImage(msg.attachment.url)}
                      />
                    </div>
                  ) : (
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] flex flex-col gap-1.5 ${
                    isMe ? (isDark ? "bg-[#00F0FF] text-black rounded-br-sm font-medium shadow-sm" : "bg-[#0A66C2] text-white rounded-br-sm font-medium shadow-sm") : (isDark ? "bg-[#1a1a1a] text-gray-200 border border-white/10 rounded-bl-sm" : "bg-white text-slate-900 border border-slate-200 rounded-bl-sm shadow-xs")
                  }`}>
                    {msg.attachment && (
                      <div>
                        {msg.attachment.type === 'image' ? (
                          <img src={msg.attachment.url} alt="attachment" className="max-w-full rounded-lg object-contain" />
                        ) : msg.attachment.type === 'video' ? (
                          <div className="max-w-full rounded-lg overflow-hidden shadow-lg border border-slate-200 dark:border-white/5 bg-black/40">
                            <video src={msg.attachment.url} controls className="w-full h-auto max-h-[150px] object-cover" />
                          </div>
                        ) : msg.attachment.type === 'audio' ? (
                          <div className="w-full bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/5 flex items-center">
                            <audio src={msg.attachment.url} controls className="w-full h-8 accent-[#00F0FF]" />
                          </div>
                        ) : (
                          <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-black/40 transition-colors">
                            <FileText size={18} className="text-[#00F0FF]" />
                            <span className="text-[11px] font-medium truncate max-w-[120px]">{msg.attachment.name}</span>
                            <Download size={14} className="text-gray-400" />
                          </a>
                        )}
                      </div>
                    )}
                    {/* Read Receipts */}
                    {isMe && (
                      <div className="flex justify-end mt-1 opacity-60">
                        {msg.pending ? (
                          <Check size={14} className="text-gray-500" />
                        ) : msg.read ? (
                          <CheckCheck size={14} className="text-[#00F0FF]" />
                        ) : (
                          <CheckCheck size={14} className="text-gray-500" />
                        )}
                      </div>
                    )}
                  </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-[#111] border-t border-slate-200 dark:border-white/10 relative">
            
            {/* Attachment Preview */}
            {attachment && (
              <div className="mb-2 p-2 bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg relative flex items-center gap-2 w-fit">
                <button type="button" onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-colors z-10">
                  <X size={12} className="text-white" />
                </button>
                {attachment.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(attachment)} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-slate-200 dark:border-white/10" />
                ) : (
                  <div className="h-10 w-10 bg-black/20 rounded-md border border-slate-200 dark:border-white/10 flex items-center justify-center">
                    <FileText size={18} className="text-[#00F0FF]" />
                  </div>
                )}
                <span className="text-xs text-slate-700 dark:text-gray-300 truncate max-w-[100px] font-medium">{attachment.name}</span>
              </div>
            )}

            <form onSubmit={send} className="flex flex-col gap-2">
              <textarea 
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                data-lenis-prevent="true"
                placeholder="Write a message..."
                className={`w-full ${isDark ? "bg-[#1a1a1a] text-white border-white/10 placeholder:text-gray-500" : "bg-slate-100 text-slate-900 border-slate-200 placeholder:text-slate-400"} border rounded-xl px-4 py-3 text-[14px] focus:outline-none resize-none h-[60px] custom-scrollbar`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(e);
                  }
                }}
              />
              <div className="flex justify-between items-center px-1 relative">
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*,.pdf,.doc,.docx,.zip,.txt"
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded transition-colors" title="Attach File/Image"><Paperclip size={18} /></button>
                  
                  <div ref={emojiPickerContainerRef} className="relative">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded transition-colors" title="Emoji"><Smile size={18} /></button>
                    {/* Emoji Picker Popover */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl scale-90 origin-bottom-left">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={300} height={350} />
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={(typeof text === 'string' ? !text.trim() : true) && !attachment || isUploading}
                  className="bg-[#0A66C2] dark:bg-[#00F0FF] text-white dark:text-black p-1.5 rounded-full disabled:opacity-50 hover:bg-[#004182] dark:hover:bg-[#00F0FF]/90 transition-colors shadow-sm cursor-pointer"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin ml-0.5" /> : <Send size={14} className="ml-0.5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>

    {/* Image Lightbox Preview Modal */}
    <AnimatePresence>
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-slate-200 dark:border-white/10 z-10"
          >
            <X size={20} />
          </button>
          <a
            href={previewImage}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-16 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-slate-200 dark:border-white/10 z-10"
          >
            <Download size={20} />
          </a>
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl border border-slate-200 dark:border-white/10"
          />
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
};

export default FloatingChat;
