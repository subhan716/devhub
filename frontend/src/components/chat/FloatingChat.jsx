import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Minus, ChevronUp, ChevronDown, Send, Image as ImageIcon, Paperclip, Smile, MoreHorizontal } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useLocation } from 'react-router-dom';

const FloatingChat = ({ currentUser }) => {
  const { socket, onlineUsers } = useSocket() || {};
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  
  // Settings
  const [muteSounds, setMuteSounds] = useState(() => localStorage.getItem('muteMessageSounds') === 'true');
  const [readReceipts, setReadReceipts] = useState(() => localStorage.getItem('disableReadReceipts') !== 'true'); // default true
  const [activeChats, setActiveChats] = useState([]); // Array of chat objects, max 3
  const [chatMessages, setChatMessages] = useState({}); // { chatId: [messages] }
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
    if (isOpen && conversations.length === 0) {
      const fetchConversations = async () => {
        try {
          const { data } = await axios.get('http://localhost:5000/api/messages/conversations', { withCredentials: true });
          setConversations(data);
        } catch (error) {
          console.error('Failed to fetch conversations', error);
        }
      };
      fetchConversations();
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
      
      // Also update conversations list if drawer is open
      if (isOpen) {
        setConversations(prev => {
          const existing = prev.findIndex(c => c.user._id === senderId);
          let newConvos = [...prev];
          if (existing !== -1) {
            newConvos[existing].latestMessage = message;
            const chat = newConvos.splice(existing, 1)[0];
            newConvos.unshift(chat);
          }
          return newConvos;
        });
      }

      // Play sound if not muted and drawer is open
      if (!muteSounds && isOpen) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio error:', e));
      }
    };
    socket.on('messageReceived', handleMessage);
    return () => socket.off('messageReceived', handleMessage);
  }, [socket, activeChats, isOpen, muteSounds]);

  const openChatHead = async (user) => {
    // If already open, do nothing
    if (activeChats.find(c => c._id === user._id)) return;
    
    // Max 3 chat heads. Remove first (oldest) if adding 4th.
    let newChats = [...activeChats];
    if (newChats.length >= 3) {
      newChats.shift(); 
    }
    newChats.push(user);
    setActiveChats(newChats);

    // Fetch messages for this chat
    try {
      const { data } = await axios.get(`http://localhost:5000/api/messages/${user._id}`, { withCredentials: true });
      setChatMessages(prev => ({ ...prev, [user._id]: data }));
    } catch (e) {
      console.error(e);
    }
  };

  const closeChatHead = (userId) => {
    setActiveChats(prev => prev.filter(c => c._id !== userId));
  };

  // Only show floating chat if NOT on /messages and if it hasn't been closed by the user
  if (location.pathname.startsWith('/messages') || !isVisible) return null;

  return (
    <div className="fixed bottom-0 right-4 z-[999] flex items-end gap-3 pointer-events-none">
      
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
          />
        ))}
      </AnimatePresence>

      {/* Main Messaging Drawer */}
      <div className="w-80 bg-[#111] border border-white/10 rounded-t-xl shadow-2xl pointer-events-auto flex flex-col transition-all duration-300">
        
        {/* Drawer Header */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-3 bg-[#1a1a1a] border-b border-white/10 flex justify-between items-center cursor-pointer rounded-t-xl hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <img 
              src={currentUser?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
              className="w-7 h-7 rounded-full border border-white/20" 
              alt="me"
            />
            <span className="font-semibold text-[15px] text-white">Messaging</span>
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
                  className="absolute bottom-full right-0 mb-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden origin-bottom-right"
                >
                  <div className="px-3 py-2 border-b border-white/5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chat Settings</span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const newVal = !muteSounds;
                      setMuteSounds(newVal);
                      localStorage.setItem('muteMessageSounds', newVal);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex justify-between items-center"
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
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex justify-between items-center"
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
              animate={{ height: 400 }}
              exit={{ height: 0 }}
              className="bg-[#111] overflow-y-auto custom-scrollbar flex flex-col"
            >
              {conversations.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  No conversations yet.
                </div>
              ) : (
                conversations.map(conv => (
                  <div 
                    key={conv.user._id}
                    onClick={() => openChatHead(conv.user)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5"
                  >
                    <div className="relative">
                      <img src={conv.user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} className="w-12 h-12 rounded-full object-cover" alt="" />
                      {onlineUsers?.includes(conv.user._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-semibold truncate">{conv.user.name}</h4>
                      <p className="text-gray-400 text-xs truncate">{conv.latestMessage?.text}</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

// Sub-component for individual chat window
const ChatWindow = ({ chat, messages, onClose, currentUser, socket, onlineUsers, setChatMessages }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages, isMinimized]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await axios.post(`http://localhost:5000/api/messages/${chat._id}`, { text }, { withCredentials: true });
      setChatMessages(prev => ({
        ...prev,
        [chat._id]: [...(prev[chat._id] || []), data]
      }));
      setText('');
      if (socket) socket.emit('sendMessage', data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="w-80 bg-[#111] border border-white/10 rounded-t-xl shadow-2xl pointer-events-auto flex flex-col"
    >
      {/* Chat Header */}
      <div 
        onClick={() => setIsMinimized(!isMinimized)}
        className="px-3 py-2 bg-[#0055FF] text-white border-b border-white/10 flex justify-between items-center cursor-pointer rounded-t-xl hover:bg-[#0044CC] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src={chat.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} className="w-8 h-8 rounded-full border border-white/20" alt="" />
            {onlineUsers?.includes(chat._id) && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#0055FF] rounded-full"></div>
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
        <div className="h-80 flex flex-col bg-[#050505]">
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-2">
            {messages.map(msg => {
              const isMe = msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] ${
                    isMe ? 'bg-[#0055FF] text-white rounded-br-sm' : 'bg-[#1a1a1a] text-gray-200 border border-white/10 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-white/10 bg-[#111]">
            <form onSubmit={send} className="flex flex-col gap-2">
              <textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(e);
                  }
                }}
                placeholder="Write a message..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0055FF]/50 resize-none max-h-20 custom-scrollbar"
                rows={1}
              />
              <div className="flex justify-between items-center px-1">
                <div className="flex gap-2 text-gray-400">
                  <ImageIcon size={16} className="cursor-pointer hover:text-white" />
                  <Paperclip size={16} className="cursor-pointer hover:text-white" />
                  <Smile size={16} className="cursor-pointer hover:text-white" />
                </div>
                <button 
                  type="submit" 
                  disabled={!text.trim()}
                  className="bg-[#0055FF] text-white p-1.5 rounded-full disabled:opacity-50 hover:bg-[#0044CC]"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FloatingChat;
