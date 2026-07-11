import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Info, Check, CheckCheck, MessageSquare, Image as ImageIcon, Paperclip, Smile, Loader2, X, FileText, Download, MoreVertical, Pencil, Trash2, CornerUpRight, CornerUpLeft, SmilePlus, Link2, AtSign, Mic, MicOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
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
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'Focused';

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [textPreviewContent, setTextPreviewContent] = useState('');
  const [isLoadingTextPreview, setIsLoadingTextPreview] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatDetails, setShowChatDetails] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardTargetMessage, setForwardTargetMessage] = useState(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState(null);
  const [searchForwardQuery, setSearchForwardQuery] = useState('');
  const [selectedForwardTargets, setSelectedForwardTargets] = useState([]);
  const [forwardComment, setForwardComment] = useState('');
  const [forwardingInProgress, setForwardingInProgress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSidebarMenuChatId, setActiveSidebarMenuChatId] = useState(null);

  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const sendOnStopRef = useRef(false);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerContainerRef = useRef(null);

  const setActiveTab = (tab) => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    }, { replace: true });
  };
  
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const isPrependingRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const typingTimeoutRef = useRef(null);

  const getFileExtension = (filename) => {
    return filename ? filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase() : '';
  };

  const handleDownloadFile = async (url, name) => {
    const toastId = toast.loading('Downloading file...');
    try {
      const secureUrl = url.replace('http://', 'https://');
      const response = await fetch(secureUrl, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Fetch download failed, falling back to direct link', error);
      try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.setAttribute('download', name);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.success('Download started!', { id: toastId });
      } catch (fallbackError) {
        toast.error('Failed to download file.', { id: toastId });
      }
    }
  };

  useEffect(() => {
    if (!previewFile) {
      setTextPreviewContent('');
      return;
    }
    const ext = getFileExtension(previewFile.name);
    const textExtensions = ['txt', 'json', 'md', 'js', 'css', 'html', 'xml'];
    
    if (textExtensions.includes(ext)) {
      const fetchText = async () => {
        setIsLoadingTextPreview(true);
        try {
          const res = await axios.get(previewFile.url);
          setTextPreviewContent(typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data);
        } catch (err) {
          setTextPreviewContent('Failed to load text preview content.');
        } finally {
          setIsLoadingTextPreview(false);
        }
      };
      fetchText();
    }
  }, [previewFile]);

  // Parse text to highlight @ mentions in message bubbles
  const renderMessageTextWithMentions = (text) => {
    if (!text) return '';
    const regex = /(@[A-Za-z0-9_-]+(?:\s[A-Za-z0-9_-]+)?)/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const nameWithoutAt = part.substring(1).trim();
        const hasMatch = (selectedChat && selectedChat.name?.toLowerCase() === nameWithoutAt.toLowerCase()) || 
                         connections.some(c => c.user?.name?.toLowerCase() === nameWithoutAt.toLowerCase());
        
        if (hasMatch) {
          return (
            <span key={index} className="text-[#00F0FF] font-bold bg-[#00F0FF]/15 px-1.5 py-0.5 rounded-lg border border-[#00F0FF]/30 inline-block my-0.5 shadow-[0_0_8px_rgba(0,240,255,0.1)] hover:bg-[#00F0FF]/25 transition-all cursor-pointer">
              {part}
            </span>
          );
        }
      }
      return part;
    });
  };

  // User Mentions Helpers
  const handleSelectMention = (user) => {
    const text = newMessage;
    const beforeAt = text.slice(0, mentionStartIndex);
    const selectionStart = inputRef.current ? inputRef.current.selectionStart : text.length;
    const afterCursor = text.slice(selectionStart);
    
    const mentionText = `@${user.name} `;
    setNewMessage(beforeAt + mentionText + afterCursor);
    setShowMentionDropdown(false);
    
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = beforeAt.length + mentionText.length;
      if (inputRef.current) {
        inputRef.current.selectionStart = newCursorPos;
        inputRef.current.selectionEnd = newCursorPos;
      }
    }, 50);
  };

  const handleAtButtonClick = () => {
    const text = newMessage;
    const selectionStart = inputRef.current ? inputRef.current.selectionStart : text.length;
    
    // Check if we need to prepend space
    const prependSpace = selectionStart > 0 && !/\s/.test(text[selectionStart - 1]);
    const atSymbol = prependSpace ? ' @' : '@';
    
    const newText = text.slice(0, selectionStart) + atSymbol + text.slice(selectionStart);
    setNewMessage(newText);
    setShowMentionDropdown(true);
    setMentionQuery('');
    setMentionStartIndex(selectionStart + (prependSpace ? 1 : 0));
    
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = selectionStart + atSymbol.length;
      if (inputRef.current) {
        inputRef.current.selectionStart = newCursorPos;
        inputRef.current.selectionEnd = newCursorPos;
      }
    }, 50);
  };

  // Voice Recording Helpers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioChunksRef.current.length > 0 && sendOnStopRef.current) {
          await handleSendVoiceMessage(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      sendOnStopRef.current = false;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start voice recording', err);
      toast.error('Could not access microphone.');
    }
  };

  const stopRecording = (shouldSend = true) => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    
    sendOnStopRef.current = shouldSend;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const cancelRecording = () => {
    stopRecording(false);
  };

  const handleSendVoiceMessage = async (blob) => {
    const toastId = toast.loading('Uploading voice note...');
    try {
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('attachment', file);
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload/chat-attachment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      const messagePayload = {
        receiverId: selectedChat._id,
        text: '',
        attachment: {
          url: data.url,
          type: 'audio',
          name: file.name
        }
      };
      
      if (replyingToMessage) {
        messagePayload.replyTo = replyingToMessage._id;
      }
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, messagePayload, { withCredentials: true });
      
      if (socket) {
        socket.emit('sendMessage', res.data.msg);
      }
      
      setMessages(prev => [...prev, res.data.msg]);
      setReplyingToMessage(null);
      toast.success('Voice message sent!', { id: toastId });
    } catch (err) {
      console.error('Failed to upload or send voice message', err);
      toast.error('Failed to send voice message.', { id: toastId });
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Scroll to bottom when messages change
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };
  useEffect(() => {
    const container = scrollContainerRef.current;
    // Don't do anything while the loader is showing (container isn't mounted yet)
    if (isLoadingMessages || !container) return;

    // When prepending older messages, keep the viewport where it was
    if (isPrependingRef.current) {
      container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
      isPrependingRef.current = false;
      return;
    }
    // First render of a chat: jump instantly to the latest message.
    // rAF ensures the DOM has painted the freshly-mounted message list.
    if (isInitialLoadRef.current) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
      isInitialLoadRef.current = false;
    } else {
      scrollToBottom('smooth');
    }
  }, [messages, isTyping, isLoadingMessages]);

  // Fetch Conversations and Connections
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convosRes, connsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations`, { withCredentials: true }),
          currentUser?._id ? axios.get(`${import.meta.env.VITE_API_URL}/api/network/connections/${currentUser._id}`, { withCredentials: true }) : Promise.resolve({ data: [] })
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
      isInitialLoadRef.current = true;
      isPrependingRef.current = false;
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/${selectedChat._id}`, { withCredentials: true });
        setMessages(data.messages);
        setHasMore(data.hasMore);
        // Mark as read
        await axios.put(`${import.meta.env.VITE_API_URL}/api/messages/${selectedChat._id}/read`, {}, { withCredentials: true });
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  // Load older messages (pagination)
  const loadMoreMessages = async () => {
    if (!selectedChat || isLoadingMore || messages.length === 0) return;
    setIsLoadingMore(true);
    const container = scrollContainerRef.current;
    prevScrollHeightRef.current = container ? container.scrollHeight : 0;
    isPrependingRef.current = true;
    try {
      const oldest = messages[0];
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/messages/${selectedChat._id}?before=${encodeURIComponent(oldest.createdAt)}`,
        { withCredentials: true }
      );
      setMessages(prev => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load older messages', error);
      isPrependingRef.current = false;
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (message) => {
      // Check if message belongs to the currently selected active chat
      const isFromActiveChat = selectedChat && (message.sender === selectedChat._id || message.sender._id === selectedChat._id);
      
      // If the message belongs to the currently selected chat, add it to the view
      if (isFromActiveChat) {
        message.read = true; // Mark as read locally since we are actively viewing this chat!
        setMessages(prev => [...prev, message]);
        // Optionally mark as read immediately if chat is open
        axios.put(`${import.meta.env.VITE_API_URL}/api/messages/${selectedChat._id}/read`, {}, { withCredentials: true }).catch(e => console.error(e));
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
          axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations`, { withCredentials: true })
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

    const handleMessagesRead = ({ readerId }) => {
      if (selectedChat && readerId === selectedChat._id) {
        setMessages(prev => prev.map(msg =>
          ((msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id) && !msg.read)
            ? { ...msg, read: true }
            : msg
        ));
      }
    };

    const handleMessageEdited = (updated) => {
      setMessages(prev => prev.map(msg => msg._id === updated._id ? updated : msg));
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    const handleMessageReacted = ({ messageId, reactions, reactorId, reactorName, emoji, messageSenderId, added }) => {
      setMessages(prev => prev.map(msg =>
        msg._id === messageId ? { ...msg, reactions } : msg
      ));

      if (added && messageSenderId === currentUser?._id && reactorId !== currentUser?._id) {
        toast(`${reactorName} reacted "${emoji}" to your message`, {
          icon: emoji,
          style: {
            background: '#181820',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px'
          }
        });
      }
    };

    socket.on('messageReceived', handleMessageReceived);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageReacted', handleMessageReacted);

    return () => {
      socket.off('messageReceived', handleMessageReceived);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageReacted', handleMessageReacted);
    };
  }, [socket, selectedChat, currentUser]);

  // Handle typing input
  const handleTypingInput = (e) => {
    const val = e.target.value;
    setNewMessage(val);
    
    // Check for @ mention trigger
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, selectionStart);
    const lastAtOffset = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtOffset !== -1) {
      const charBeforeAt = lastAtOffset > 0 ? textBeforeCursor[lastAtOffset - 1] : ' ';
      if (/\s/.test(charBeforeAt)) {
        const query = textBeforeCursor.slice(lastAtOffset + 1);
        if (!/\s/.test(query)) {
          setShowMentionDropdown(true);
          setMentionQuery(query);
          setMentionStartIndex(lastAtOffset);
        } else {
          setShowMentionDropdown(false);
        }
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
    
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

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedChat || isUploading) return;

    try {
      const tempId = 'temp_' + Date.now();
      const currentText = newMessage;
      const currentAttachment = attachment;

      const optimisticMsg = {
        _id: tempId,
        sender: currentUser,
        receiver: selectedChat._id,
        text: currentText,
        attachment: currentAttachment ? { 
          url: URL.createObjectURL(currentAttachment), 
          type: currentAttachment.type.startsWith('image') ? 'image' : 'file', 
          name: currentAttachment.name 
        } : null,
        createdAt: new Date().toISOString(),
        read: false,
        pending: true,
        replyTo: replyingToMessage ? { ...replyingToMessage } : null
      };

      // Truly optimistic UI update
      setMessages(prev => [...prev, optimisticMsg]);
      setNewMessage('');
      setAttachment(null);
      setShowEmojiPicker(false);
      setReplyingToMessage(null); // Clear reply status
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

      const { data: savedMessage } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/messages/${selectedChat._id}`,
        { 
          text: currentText,
          attachment: attachmentData,
          replyTo: optimisticMsg.replyTo?._id
        },
        { withCredentials: true }
      );

      // Replace optimistic message with real saved message
      setMessages(prev => prev.map(m => m._id === tempId ? savedMessage : m));
      
      // Emit via socket
      if (socket) {
        socket.emit('sendMessage', savedMessage);
        socket.emit('stopTyping', { senderId: currentUser?._id, receiverId: selectedChat._id });
      }

      // Update local conversations list to move this to the top
      setConversations(prev => {
        const existingChatIndex = prev.findIndex(c => c.user._id === selectedChat._id);
        let newConvos = [...prev];
        
        if (existingChatIndex !== -1) {
          const chat = { ...newConvos[existingChatIndex] };
          chat.latestMessage = savedMessage;
          newConvos.splice(existingChatIndex, 1);
          newConvos.unshift(chat);
        } else {
          newConvos.unshift({
            user: selectedChat,
            latestMessage: savedMessage,
            unreadCount: 0
          });
        }
        return newConvos;
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

  // --- Sidebar filtering (Search + Focused/Other tabs) ---
  // Focused = people you're connected with. Other = strangers who messaged you.
  const connectionIds = new Set(connections.map(c => c.user._id));
  const matchesSearch = (name) => (name || '').toLowerCase().includes(searchQuery.trim().toLowerCase());

  const visibleConversations = conversations.filter(chat => {
    if (!matchesSearch(chat.user.name)) return false;
    const isConnected = connectionIds.has(chat.user._id);
    return activeTab === 'Focused' ? isConnected : !isConnected;
  });

  // Connections you haven't chatted with yet only belong under "Focused"
  const visibleConnections = activeTab === 'Focused'
    ? connections.filter(conn =>
        !conversations.some(conv => conv.user._id === conn.user._id) &&
        matchesSearch(conn.user?.name)
      )
    : [];

  // Begin editing a message
  const startEditing = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text || '');
    setOpenMenuId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  // Save an edited message
  const saveEdit = async (msg) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    if (trimmed === msg.text) {
      cancelEditing();
      return;
    }
    // Optimistic update
    setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, text: trimmed, edited: true } : m));
    setEditingMessageId(null);
    setEditText('');
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/messages/message/${msg._id}`,
        { text: trimmed },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to edit message', error);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (msg) => {
    setOpenMenuId(null);
    // Optimistic removal
    setMessages(prev => prev.filter(m => m._id !== msg._id));
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/messages/message/${msg._id}`, { withCredentials: true });
    } catch (error) {
      console.error('Failed to delete message', error);
    }
  };

  // Close the emoji picker and mentions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerContainerRef.current && !emojiPickerContainerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (showMentionDropdown) {
        setShowMentionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMentionDropdown]);

  // Close active dropdown or reaction menus when clicking anywhere else
  useEffect(() => {
    if (!openMenuId && !activeReactionMenuId && !activeSidebarMenuChatId) return;
    const closeMenus = () => {
      setOpenMenuId(null);
      setActiveReactionMenuId(null);
      setActiveSidebarMenuChatId(null);
    };
    document.addEventListener('click', closeMenus);
    return () => document.removeEventListener('click', closeMenus);
  }, [openMenuId, activeReactionMenuId, activeSidebarMenuChatId]);

  // Toggle reaction handler
  const handleToggleReaction = async (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg._id !== messageId) return msg;
      
      const reactions = [...(msg.reactions || [])];
      const existingIdx = reactions.findIndex(r => (r.user?._id || r.user) === currentUser?._id && r.emoji === emoji);
      
      if (existingIdx > -1) {
        reactions.splice(existingIdx, 1);
      } else {
        reactions.push({ user: currentUser, emoji });
      }
      return { ...msg, reactions };
    }));

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/react/${messageId}`, { emoji }, { withCredentials: true });
    } catch (error) {
      console.error('Failed to toggle reaction', error);
    }
  };

  // Reply trigger that focuses text area
  const handleInitiateReply = (msg) => {
    setReplyingToMessage(msg);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Forward message handler
  const handleForwardMessage = async () => {
    if (selectedForwardTargets.length === 0 || !forwardTargetMessage) return;
    try {
      setForwardingInProgress(true);
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/forward`, {
        messageId: forwardTargetMessage._id,
        targetUserIds: selectedForwardTargets,
        comment: forwardComment
      }, { withCredentials: true });

      // Append forwarded messages if they belong to current active chat
      if (selectedChat) {
        // The API returns { msg, messages: [...] }
        const matchingMessages = (data.messages || []).filter(m => 
          (m.receiver?._id || m.receiver) === selectedChat._id || 
          (m.sender?._id || m.sender) === selectedChat._id
        );
        if (matchingMessages.length > 0) {
          // Socket will handle receiving, but to update instantly for sender:
          setMessages(prev => [...prev, ...matchingMessages]);
        }
      }

      // Close modal and reset
      setShowForwardModal(false);
      setForwardTargetMessage(null);
      setSelectedForwardTargets([]);
      setForwardComment('');
      setSearchForwardQuery('');

      // Refresh conversations list
      const convosRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/conversations`, { withCredentials: true });
      setConversations(convosRes.data);
    } catch (error) {
      console.error('Failed to forward message', error);
    } finally {
      setForwardingInProgress(false);
    }
  };

  const handleCopyLink = () => {
    if (!forwardTargetMessage) return;
    const content = forwardTargetMessage.text || forwardTargetMessage.attachment?.url || '';
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy', err);
    });
  };

  // Filter connections for the Forward Modal:
  // 1. Exclude the person we are currently chatting with (selectedChat?._id)
  // 2. If search query is empty: show only up to 15 connections with whom we have existing conversations (frequent chats)
  // 3. If search query is not empty: search through all connections
  const conversedUserIds = new Set(conversations.map(c => c.user?._id));
  const activePartnerId = selectedChat?._id;

  const forwardDisplayList = (() => {
    const eligibleConnections = connections.filter(conn => 
      conn.user && (!activePartnerId || conn.user._id !== activePartnerId)
    );
    const query = searchForwardQuery.trim().toLowerCase();
    if (!query) {
      // Empty query: only return connections that have existing active conversations (Focused ones)
      return eligibleConnections
        .filter(conn => conversedUserIds.has(conn.user._id))
        .slice(0, 15);
    } else {
      // Query present: search through all connections
      return eligibleConnections.filter(conn => 
        conn.user.name?.toLowerCase().includes(query)
      );
    }
  })();

  const mentionCandidates = (() => {
    const list = [];
    const seen = new Set();

    // 1. Add selectedChat (active DM partner)
    if (selectedChat) {
      if (selectedChat.members && Array.isArray(selectedChat.members)) {
        selectedChat.members.forEach(member => {
          if (member && member._id !== currentUser?._id && !seen.has(member._id)) {
            seen.add(member._id);
            list.push(member);
          }
        });
      } else if (!seen.has(selectedChat._id)) {
        seen.add(selectedChat._id);
        list.push(selectedChat);
      }
    }

    // 2. Add connections
    if (Array.isArray(connections)) {
      connections.forEach(conn => {
        if (conn && conn.user && conn.user._id !== currentUser?._id && !seen.has(conn.user._id)) {
          seen.add(conn.user._id);
          list.push(conn.user);
        }
      });
    }

    // 3. Filter by query
    const query = (mentionQuery || '').toLowerCase();
    return list.filter(user => 
      user && user.name && user.name.toLowerCase().includes(query)
    );
  })();

  return (
    <>
    <div className="flex-1 flex bg-[#0a0a0c] overflow-hidden relative">
      
      {/* Left Sidebar - Conversations */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-[#0e0e11] shadow-[4px_0_24px_rgba(0,0,0,0.35)] z-10 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-6 relative z-10 bg-[#0e0e11]">
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Messages</h2>
          </div>
          <div className="relative group mt-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00F0FF] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages"
                className="w-full bg-[#050507] border border-white/5 rounded-xl py-2 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-[#00F0FF]/30 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Tabs - Sleek MacOS/Slack Pill Tabs */}
        <div className="mx-4 mb-3 p-1 flex gap-1 bg-[#050507] rounded-xl border border-white/[0.02]">
          <button 
            onClick={() => setActiveTab('Focused')}
            className={`flex-1 py-1.5 text-xs font-bold transition-all rounded-lg ${activeTab === 'Focused' ? 'text-white bg-white/10 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Focused
          </button>
          <button 
            onClick={() => setActiveTab('Other')}
            className={`flex-1 py-1.5 text-xs font-bold transition-all rounded-lg ${activeTab === 'Other' ? 'text-white bg-white/10 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
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
                {visibleConversations.map((chat, idx) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    key={chat.user._id}
                    onClick={() => setSelectedChat(chat.user)}
                    className={`mx-2 my-0.5 px-3 py-2.5 flex items-start gap-3 cursor-pointer transition-all rounded-xl group ${
                      selectedChat?._id === chat.user._id 
                        ? 'bg-white/5 text-white shadow-sm' 
                        : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200'
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
                        {chat.latestMessage ? (
                          chat.latestMessage.text ? (
                            chat.latestMessage.text
                          ) : chat.latestMessage.attachment ? (
                            chat.latestMessage.attachment.type === 'image' ? 'Photo 📷' :
                            chat.latestMessage.attachment.type === 'video' ? 'Video 🎥' :
                            chat.latestMessage.attachment.type === 'audio' ? 'Voice note 🎵' :
                            `File 📂`
                          ) : 'Started a conversation'
                        ) : 'Started a conversation'}
                      </p>
                    </div>
                    
                    {/* Unread Badge / Hover Options Menu */}
                    <div className="relative ml-2 flex-shrink-0 flex items-center justify-center self-center min-w-[20px]">
                      {chat.latestMessage?.receiver === currentUser?._id && !chat.latestMessage?.read && (
                        <div className={`w-2.5 h-2.5 bg-[#00F0FF] rounded-full transition-all ${activeSidebarMenuChatId === chat.user._id ? 'hidden' : 'group-hover:hidden'}`}></div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSidebarMenuChatId(activeSidebarMenuChatId === chat.user._id ? null : chat.user._id);
                        }}
                        className={`p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors ${activeSidebarMenuChatId === chat.user._id ? 'block' : 'hidden group-hover:block'}`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeSidebarMenuChatId === chat.user._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-7 z-30 w-44 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(chat.user.name);
                              toast.success('Name copied!');
                              setActiveSidebarMenuChatId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-white/10 transition-colors flex items-center gap-2"
                          >
                            Copy name
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const profileUrl = `${window.location.origin}/profile/${chat.user._id}`;
                              navigator.clipboard.writeText(profileUrl);
                              toast.success('Profile link copied!');
                              setActiveSidebarMenuChatId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-white/10 transition-colors flex items-center gap-2"
                          >
                            Copy profile link
                          </button>
                          <a
                            href={`/profile/${chat.user._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setActiveSidebarMenuChatId(null)}
                            className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-white/10 transition-colors flex items-center gap-2"
                          >
                            View profile
                          </a>
                          <div className="h-px bg-white/5 my-1"></div>
                          <button
                            type="button"
                            onClick={() => {
                              setConversations(prev => prev.filter(c => c.user._id !== chat.user._id));
                              if (selectedChat?._id === chat.user._id) {
                                setSelectedChat(null);
                              }
                              toast.success('Conversation closed');
                              setActiveSidebarMenuChatId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                          >
                            Close conversation
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Connections without existing conversations */}
                {visibleConnections.map((conn, idx) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (conversations.length + idx) * 0.03 }}
                    key={`conn-${conn.user._id}`}
                    onClick={() => setSelectedChat(conn.user)}
                    className={`mx-2 my-0.5 px-3 py-2.5 flex items-start gap-3 cursor-pointer transition-all rounded-xl group ${
                      selectedChat?._id === conn.user._id 
                        ? 'bg-white/5 text-white shadow-sm' 
                        : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200'
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

                {/* No results for current tab / search */}
                {visibleConversations.length === 0 && visibleConnections.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-gray-500 p-8 text-center">
                    <Search size={32} className="mb-3 opacity-30" />
                    <p className="text-sm">
                      {searchQuery
                        ? `No matches for "${searchQuery}"`
                        : activeTab === 'Other'
                          ? 'No other messages'
                          : 'No focused conversations'}
                    </p>
                  </motion.div>
                )}
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
          <div className="flex-1 flex min-w-0 min-h-0">
            {/* Main chat column */}
            <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${showChatDetails ? 'hidden lg:flex' : 'flex'}`}>
            <div className="px-6 py-4 bg-[#131317]/80 backdrop-blur-md flex justify-between items-center z-10 shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
              <div className="flex items-center gap-4">
                <button 
                  className="md:hidden p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setSelectedChat(null)}
                >
                  ←
                </button>
                <div className="relative cursor-pointer" onClick={() => setShowChatDetails(v => !v)}>
                  <img
                    src={selectedChat.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                    alt={selectedChat.name}
                    className="w-11 h-11 rounded-full object-cover border border-white/10 hover:opacity-80 transition-opacity"
                  />
                  {isUserOnline(selectedChat._id) && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00F0FF] border-2 border-[#111] rounded-full shadow-[0_0_8px_rgba(0,240,255,0.5)]"></div>
                  )}
                </div>
                <div>
                  <h3 onClick={() => setShowChatDetails(v => !v)} className="text-white font-bold text-[17px] leading-tight cursor-pointer hover:text-[#00F0FF] transition-colors">{selectedChat.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${isUserOnline(selectedChat._id) ? 'bg-[#00F0FF] shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'bg-gray-500'}`}></span>
                    <span className="text-[12px] font-medium text-gray-400">
                      {isUserOnline(selectedChat._id) ? 'Active now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowChatDetails(v => !v)}
                title="Contact info"
                className={`p-2 rounded-xl transition-colors ${showChatDetails ? 'bg-white/10 text-[#00F0FF]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Info size={20} />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div ref={scrollContainerRef} data-lenis-prevent="true" className="flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col relative bg-[#131317] bg-[url('/grid.svg')] bg-[length:40px_40px] px-8 py-6">
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
                  {hasMore && messages.length > 0 && (
                    <div className="flex justify-center py-2">
                      <button
                        onClick={loadMoreMessages}
                        disabled={isLoadingMore}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#00F0FF] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Show older messages'
                        )}
                      </button>
                    </div>
                  )}
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

                    // Discord-style grouping: hide avatar + name header when the
                    // previous message is from the same sender and there's no time
                    // divider between them.
                    const prevMsg = messages[index - 1];
                    const senderId = msg.sender?._id || msg.sender;
                    const prevSenderId = prevMsg && (prevMsg.sender?._id || prevMsg.sender);
                    const isGrouped = !showTime && prevMsg && senderId === prevSenderId;

                    const isEditing = editingMessageId === msg._id;

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        key={msg._id}
                        className={`flex flex-col ${showTime ? '' : isGrouped ? 'mt-0.5' : 'mt-4'}`}
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

                        <div className={`relative flex gap-4 group hover:bg-white/[0.02] px-4 -mx-4 rounded-lg transition-colors ${isGrouped ? 'py-0.5' : 'py-2'}`}>
                          {/* Avatar (or a spacer + hover timestamp when grouped) */}
                          {isGrouped ? (
                            <div className="w-10 flex-shrink-0 flex items-start justify-center pt-1">
                              <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity leading-none">
                                {format(new Date(msg.createdAt), 'h:mm a')}
                              </span>
                            </div>
                          ) : (
                            <img
                              src={isMe ? (currentUser?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') : (selectedChat.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full object-cover shadow-md border border-white/5 mt-0.5 flex-shrink-0"
                            />
                          )}

                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
                            {/* Forwarded Tag */}
                            {msg.forwarded && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 italic mb-0.5">
                                <CornerUpRight size={10} />
                                <span>Forwarded</span>
                              </div>
                            )}

                            {/* Header: Name and Time (hidden when grouped) */}
                            {!isGrouped && (
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold text-[15px] text-white">
                                  {isMe ? currentUser?.name : selectedChat.name}
                                </span>
                                <span className="text-[12px] text-gray-500 font-medium">
                                  • {format(new Date(msg.createdAt), 'h:mm a')}
                                </span>
                                {/* Read Receipts (inline, next to time) */}
                                {isMe && (
                                  <span className="opacity-60">
                                    {msg.pending ? (
                                      <Check size={14} className="text-gray-500" />
                                    ) : msg.read ? (
                                      <CheckCheck size={14} className="text-[#00F0FF]" />
                                    ) : (
                                      <CheckCheck size={14} className="text-gray-500" />
                                    )}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Quote Reply Block */}
                            {msg.replyTo && (
                              <div className="mb-2 pl-3 border-l-2 border-[#00F0FF]/50 bg-white/5 rounded-r-lg p-2 max-w-[400px] flex items-center justify-between text-xs text-gray-400 gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-[11px] text-white truncate">
                                    {msg.replyTo.sender?._id === currentUser?._id ? 'You' : msg.replyTo.sender?.name}
                                  </div>
                                  <div className="truncate mt-0.5 text-gray-300">
                                    {msg.replyTo.text ? (
                                      msg.replyTo.text
                                    ) : msg.replyTo.attachment ? (
                                      msg.replyTo.attachment.type === 'image' ? 'Photo 📷' :
                                      msg.replyTo.attachment.type === 'video' ? 'Video 🎥' :
                                      msg.replyTo.attachment.type === 'audio' ? 'Audio 🎵' :
                                      `File: ${msg.replyTo.attachment.name} 📂`
                                    ) : ''}
                                  </div>
                                </div>
                                {msg.replyTo.attachment && msg.replyTo.attachment.type === 'image' && (
                                  <img 
                                    src={msg.replyTo.attachment.url} 
                                    alt="" 
                                    className="w-8 h-8 rounded object-cover border border-white/10 flex-shrink-0"
                                  />
                                )}
                              </div>
                            )}

                            {/* Attachment */}
                            {msg.attachment && (
                              <div className="mb-2 mt-2">
                                {msg.attachment.type === 'image' ? (
                                  <div className="max-w-[300px]">
                                    <img
                                      src={msg.attachment.url}
                                      alt="attachment"
                                      className="w-full rounded-xl object-cover shadow-lg cursor-zoom-in hover:opacity-95 transition-opacity border border-white/10"
                                      onClick={() => setPreviewFile(msg.attachment)}
                                    />
                                  </div>
                                ) : msg.attachment.type === 'video' ? (
                                  <div className="max-w-[350px] rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black/40 cursor-pointer" onClick={() => setPreviewFile(msg.attachment)}>
                                    <video src={msg.attachment.url} controls className="w-full h-auto max-h-[250px] object-cover" onClick={(e) => e.stopPropagation()} />
                                  </div>
                                ) : msg.attachment.type === 'audio' ? (
                                  <div className="w-full max-w-[300px] bg-white/5 p-2 rounded-xl border border-white/10 flex items-center gap-2 cursor-pointer" onClick={() => setPreviewFile(msg.attachment)}>
                                    <audio src={msg.attachment.url} controls className="w-full h-10 accent-[#00F0FF]" onClick={(e) => e.stopPropagation()} />
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => setPreviewFile(msg.attachment)}
                                    className="inline-flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                                  >
                                    <FileText size={24} className="text-[#00F0FF]" />
                                    <span className="text-sm font-medium text-gray-200 truncate max-w-[200px]">{msg.attachment.name}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadFile(msg.attachment.url, msg.attachment.name);
                                      }}
                                      className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors ml-2"
                                      title="Download File"
                                    >
                                      <Download size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Text (or inline editor) */}
                            {isEditing ? (
                              <div className="mt-1">
                                <textarea
                                  autoFocus
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      saveEdit(msg);
                                    } else if (e.key === 'Escape') {
                                      cancelEditing();
                                    }
                                  }}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[15px] text-gray-200 resize-none focus:outline-none focus:border-[#00F0FF]/50 custom-scrollbar"
                                  rows={2}
                                />
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                  <button onClick={() => saveEdit(msg)} className="text-[#00F0FF] hover:underline font-semibold">Save</button>
                                  <button onClick={cancelEditing} className="hover:underline">Cancel</button>
                                  <span>Enter to save • Esc to cancel</span>
                                </div>
                              </div>
                            ) : (
                              msg.text && (
                                <div className="text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap">
                                  {renderMessageTextWithMentions(msg.text)}
                                  {msg.edited && (
                                    <span className="text-[10px] text-gray-500 ml-1.5 align-baseline">(edited)</span>
                                  )}
                                </div>
                              )
                            )}

                            {/* Reactions Display */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {Object.entries(
                                  msg.reactions.reduce((acc, curr) => {
                                    if (curr.emoji) {
                                      acc[curr.emoji] = acc[curr.emoji] || [];
                                      acc[curr.emoji].push(curr.user?._id || curr.user);
                                    }
                                    return acc;
                                  }, {})
                                ).map(([emoji, users]) => {
                                  const hasReacted = users.includes(currentUser?._id);
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => handleToggleReaction(msg._id, emoji)}
                                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
                                        hasReacted
                                          ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]'
                                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                      }`}
                                    >
                                      <span>{emoji}</span>
                                      <span className="font-semibold">{users.length}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Slack-style Message Action Bar (Hover Overlay) */}
                          {!msg.pending && !isEditing && (
                            <div className={`absolute -top-3 right-4 z-20 transition-all duration-200 flex items-center bg-[#161616] border border-white/10 rounded-lg shadow-xl px-1.5 py-0.5 gap-1.5 ${
                              (openMenuId === msg._id || activeReactionMenuId === msg._id)
                                ? 'opacity-100'
                                : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
                            }`}>
                              {/* Quick React Emojis */}
                              {['✅', '👀', '🙌'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleToggleReaction(msg._id, emoji)}
                                  className="p-1 text-sm hover:bg-white/10 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}

                              <div className="w-px h-4 bg-white/10 mx-0.5"></div>

                              {/* React Menu Toggle */}
                              <div className="relative">
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setActiveReactionMenuId(activeReactionMenuId === msg._id ? null : msg._id); 
                                    setOpenMenuId(null);
                                  }}
                                  className={`p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors ${activeReactionMenuId === msg._id ? 'text-white bg-white/10' : ''}`}
                                  title="Add reaction"
                                >
                                  <SmilePlus size={16} />
                                </button>
                                
                                {activeReactionMenuId === msg._id && (
                                  <div className="absolute bottom-full right-0 mb-2 z-30 shadow-2xl scale-90 origin-bottom-right" onClick={(e) => e.stopPropagation()}>
                                    <EmojiPicker 
                                      onEmojiClick={(emojiObj) => {
                                        handleToggleReaction(msg._id, emojiObj.emoji);
                                        setActiveReactionMenuId(null);
                                      }} 
                                      theme="dark" 
                                      width={280} 
                                      height={320} 
                                      previewConfig={{ showPreview: false }}
                                      skinTonesDisabled
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Reply Button */}
                              <button
                                onClick={() => handleInitiateReply(msg)}
                                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Reply"
                              >
                                <CornerUpLeft size={16} />
                              </button>

                              {/* Forward Button */}
                              <button
                                onClick={() => {
                                  setForwardTargetMessage(msg);
                                  setShowForwardModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Forward"
                              >
                                <CornerUpRight size={16} />
                              </button>

                              {/* 3-dots dropmenu (Edit / Delete) */}
                              <div className="relative">
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setOpenMenuId(openMenuId === msg._id ? null : msg._id); 
                                    setActiveReactionMenuId(null);
                                  }}
                                  className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                  title="More actions"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {openMenuId === msg._id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 bottom-full mb-2 z-30 w-32 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
                                  >
                                    {isMe && msg.text && (
                                      <button
                                        onClick={() => startEditing(msg)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors"
                                      >
                                        <Pencil size={14} /> Edit
                                      </button>
                                    )}
                                    {isMe && (
                                      <button
                                        onClick={() => handleDeleteMessage(msg)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                      >
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    )}
                                    {!isMe && (
                                      <div className="px-3 py-2 text-xs text-gray-500 text-center">No actions</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
                
                {/* Typing Indicator */}
                {isTyping && selectedChat && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-start mb-1.5"
                  >
                    <div className="bg-[#111] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-lg backdrop-blur-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                        <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{selectedChat.name} is typing...</span>
                    </div>
                  </motion.div>
                )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input Form - Floating Panel */}
            <div className="px-6 pb-6 pt-2 bg-transparent relative z-10 flex flex-col gap-3">
              
              {/* Quote Reply Banner */}
              {replyingToMessage && (
                <div className="mx-2 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <CornerUpLeft size={12} className="text-[#00F0FF]" />
                        <span>Replying to </span>
                        <span className="font-bold text-white">
                          {replyingToMessage.sender?._id === currentUser?._id ? 'yourself' : replyingToMessage.sender?.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 truncate mt-0.5">
                        {replyingToMessage.text ? (
                          replyingToMessage.text
                        ) : replyingToMessage.attachment ? (
                          replyingToMessage.attachment.type === 'image' ? 'Photo 📷' :
                          replyingToMessage.attachment.type === 'video' ? 'Video 🎥' :
                          replyingToMessage.attachment.type === 'audio' ? 'Audio 🎵' :
                          `File: ${replyingToMessage.attachment.name} 📂`
                        ) : ''}
                      </div>
                    </div>
                    {replyingToMessage.attachment && replyingToMessage.attachment.type === 'image' && (
                      <img 
                        src={replyingToMessage.attachment.url} 
                        alt="" 
                        className="w-10 h-10 rounded object-cover border border-white/10 flex-shrink-0"
                      />
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setReplyingToMessage(null)} 
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
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

              <div ref={emojiPickerContainerRef} className="flex items-center gap-1.5 px-2 relative">
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
                
                {/* At Sign Mention Button */}
                <button 
                  type="button" 
                  onClick={handleAtButtonClick} 
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
                  title="Mention user"
                >
                  <AtSign size={20} />
                </button>

                {/* Mic Record Button */}
                <button 
                  type="button" 
                  onClick={startRecording} 
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" 
                  title="Record voice note"
                >
                  <Mic size={20} />
                </button>

                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 left-0 z-50 shadow-2xl">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                  </div>
                )}

                {/* Mention Autocomplete Dropdown */}
                {showMentionDropdown && mentionCandidates.length > 0 && (
                  <div className="absolute bottom-full mb-2 left-2 z-50 w-72 bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden py-1.5 flex flex-col max-h-48 overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {mentionCandidates.map(user => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleSelectMention(user)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left border-b border-white/[0.02] last:border-b-0 flex-shrink-0"
                      >
                        <img
                          src={user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover border border-white/10 animate-in fade-in zoom-in-50 duration-200"
                        />
                        <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {isRecording ? (
                <div className="flex items-center justify-between gap-4 bg-[#181820] border border-red-500/20 rounded-2xl px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                  {/* Blinking Dot and Duration */}
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                    <span className="text-sm font-bold text-red-500 tracking-wider">{formatDuration(recordingDuration)}</span>
                  </div>

                  {/* Equalizer animation */}
                  <div className="flex items-center gap-1 flex-1 justify-center px-4">
                    <span className="w-1 h-3 bg-red-500/60 rounded-full animate-pulse"></span>
                    <span className="w-1 h-5 bg-red-500/80 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-7 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-5 bg-red-500/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                    <span className="w-1 h-3 bg-red-500/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                  </div>

                  {/* Actions (Cancel / Send) */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded-full transition-colors"
                      title="Cancel Recording"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => stopRecording(true)}
                      className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      title="Send Voice Note"
                    >
                      <Send size={18} className="ml-0.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <form 
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-3 bg-[#181820] border border-white/5 rounded-2xl px-4 py-2.5 focus-within:border-[#0055FF]/30 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.4)] animate-in fade-in duration-200"
                >
                  <textarea 
                    ref={inputRef}
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
                    className="flex-1 bg-transparent border-0 border-none outline-none focus:outline-none focus:ring-0 focus:border-none text-white placeholder-gray-500 px-2 py-2 text-[15px] resize-none max-h-32 custom-scrollbar min-h-[44px] shadow-none outline-none focus:shadow-none focus:ring-transparent focus:ring-offset-0 focus:outline-transparent"
                    style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
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
              )}
            </div>
            </div>
            {/* End main chat column */}

            {/* Contact Info / Details Panel */}
            <AnimatePresence>
              {showChatDetails && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-full lg:w-[340px] flex-shrink-0 bg-[#0e0e11] flex flex-col overflow-y-auto custom-scrollbar shadow-[-4px_0_24px_rgba(0,0,0,0.3)] z-20"
                >
                  {/* Header */}
                  <div className="h-[73px] flex items-center px-6 sticky top-0 bg-[#0e0e11]/90 backdrop-blur-md z-10 gap-3 shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
                    <button onClick={() => setShowChatDetails(false)} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                      <X size={20} />
                    </button>
                    <h2 className="text-white font-bold text-lg">Contact Info</h2>
                  </div>

                  {/* Profile */}
                  <div className="p-6 flex flex-col items-center">
                    <img
                      src={selectedChat.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                      alt={selectedChat.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#111] shadow-2xl mb-4 cursor-zoom-in"
                      onClick={() => selectedChat.avatar?.url && setPreviewFile({ url: selectedChat.avatar.url, name: `${selectedChat.name}'s Profile Picture.jpg`, type: 'image' })}
                    />
                    <h3 className="text-xl font-bold text-white text-center">{selectedChat.name}</h3>
                    {selectedChat.email && (
                      <p className="text-gray-400 text-sm mt-1">{selectedChat.email}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`w-2 h-2 rounded-full ${isUserOnline(selectedChat._id) ? 'bg-[#00F0FF]' : 'bg-gray-500'}`}></span>
                      <span className="text-xs text-gray-400">{isUserOnline(selectedChat._id) ? 'Active now' : 'Offline'}</span>
                    </div>

                    <a
                      href={`/profile/${selectedChat._id}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-5 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold flex justify-center items-center gap-2 transition-colors"
                    >
                      <Info size={16} /> View Profile
                    </a>
                  </div>

                  {/* Shared Media */}
                  <div className="p-6">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                      Shared Media
                      <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {messages.filter(m => m.attachment?.type === 'image').length}
                      </span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {messages.filter(m => m.attachment?.type === 'image').slice(-9).reverse().map((msg, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10 cursor-zoom-in hover:opacity-80 transition-opacity" onClick={() => setPreviewFile(msg.attachment)}>
                          <img src={msg.attachment.url} alt="media" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {messages.filter(m => m.attachment?.type === 'image').length === 0 && (
                        <p className="col-span-3 text-xs text-gray-500 text-center py-4">No media shared yet</p>
                      )}
                    </div>
                  </div>

                  {/* Shared Documents */}
                  <div className="p-6 pt-0">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                      Documents
                      <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">
                        {messages.filter(m => m.attachment && m.attachment.type !== 'image').length}
                      </span>
                    </h4>
                    <div className="flex flex-col gap-2">
                      {messages.filter(m => m.attachment && m.attachment.type !== 'image').reverse().map((msg, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setPreviewFile(msg.attachment)} 
                          className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <div className="p-2 bg-[#00F0FF]/10 rounded-lg">
                            <FileText size={16} className="text-[#00F0FF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200 truncate font-medium">{msg.attachment.name}</p>
                            <p className="text-[10px] text-gray-500">{format(new Date(msg.createdAt), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      ))}
                      {messages.filter(m => m.attachment && m.attachment.type !== 'image').length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">No documents shared</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>

    {/* Slack-style Unified File/Media Preview Modal */}
    <AnimatePresence>
      {previewFile && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#111]">
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <FileText className="text-[#00F0FF] flex-shrink-0" size={20} />
                <h3 className="text-white text-sm font-semibold truncate max-w-[50vw]">{previewFile.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewFile.url, previewFile.name)}
                  className="bg-white/5 hover:bg-white/10 text-white rounded-xl px-4 py-2 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Download size={14} /> Download
                </button>
                <button 
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[#050505] p-6 flex items-center justify-center overflow-hidden relative">
              {(() => {
                const ext = getFileExtension(previewFile.name);
                
                // 1. Image formats
                if (previewFile.type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
                  return (
                    <img 
                      src={previewFile.url} 
                      alt={previewFile.name} 
                      className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl border border-white/5"
                    />
                  );
                }

                // 2. Video formats
                if (previewFile.type === 'video' || ['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
                  return (
                    <video 
                      src={previewFile.url} 
                      controls 
                      className="max-w-full max-h-[70vh] rounded-xl object-contain border border-white/5"
                    />
                  );
                }

                // 3. Audio formats
                if (previewFile.type === 'audio' || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
                  return (
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 w-full max-w-md flex flex-col items-center gap-4 text-center">
                      <div className="p-4 bg-[#00F0FF]/10 rounded-full border border-[#00F0FF]/20">
                        <FileText className="text-[#00F0FF]" size={36} />
                      </div>
                      <span className="text-sm text-gray-200 font-semibold truncate w-full">{previewFile.name}</span>
                      <audio src={previewFile.url} controls className="w-full mt-2 accent-[#00F0FF]" />
                    </div>
                  );
                }

                // 4. PDFs and MS Office files (Word, Excel, PowerPoint)
                if (['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext)) {
                  const secureUrl = previewFile.url.replace('http://', 'https://');
                  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(secureUrl)}&embedded=true`;
                  return (
                    <iframe 
                      src={viewerUrl} 
                      className="w-full h-full rounded-xl border border-white/5 bg-[#111]" 
                      title="Document Preview"
                    />
                  );
                }

                // 6. Text Files
                const textExtensions = ['txt', 'json', 'md', 'js', 'css', 'html', 'xml'];
                if (textExtensions.includes(ext)) {
                  return isLoadingTextPreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={36} className="animate-spin text-[#00F0FF]" />
                      <span className="text-xs text-gray-500">Fetching preview content...</span>
                    </div>
                  ) : (
                    <pre className="w-full h-full p-6 overflow-auto bg-[#050505] border border-white/5 rounded-xl text-gray-300 font-mono text-sm whitespace-pre-wrap text-left custom-scrollbar">
                      {textPreviewContent}
                    </pre>
                  );
                }

                // 7. Fallback: No preview available
                return (
                  <div className="bg-[#111] p-8 rounded-2xl border border-white/5 w-full max-w-md flex flex-col items-center gap-5 text-center shadow-2xl">
                    <div className="p-5 bg-white/5 rounded-full border border-white/10">
                      <FileText className="text-gray-400" size={40} />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                      <span className="text-sm font-bold text-white truncate px-2">{previewFile.name}</span>
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{ext || 'unknown'} file</span>
                    </div>
                    <p className="text-xs text-gray-400 max-w-[280px]">
                      This file format cannot be previewed directly in the browser. Please download the file to view its contents.
                    </p>
                    <button
                      onClick={() => handleDownloadFile(previewFile.url, previewFile.name)}
                      className="w-full py-2.5 bg-[#00F0FF] hover:bg-[#00D0DF] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                    >
                      <Download size={14} /> Download File
                    </button>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Forward Share Modal */}
    <AnimatePresence>
      {showForwardModal && forwardTargetMessage && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-white text-lg font-bold">Share message</h3>
              <button 
                type="button"
                onClick={() => {
                  setShowForwardModal(false);
                  setForwardTargetMessage(null);
                  setSelectedForwardTargets([]);
                  setForwardComment('');
                }}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Search contacts input */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search for person"
                  value={searchForwardQuery}
                  onChange={(e) => setSearchForwardQuery(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors placeholder:text-gray-600"
                />
              </div>

              {/* Contacts checklist list */}
              <div className="max-h-36 overflow-y-auto custom-scrollbar border border-white/5 bg-[#161616]/30 rounded-xl p-2 flex flex-col gap-1.5">
                {forwardDisplayList.map((conn) => {
                  const isSelected = selectedForwardTargets.includes(conn.user._id);
                  return (
                    <label 
                      key={conn.user._id} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={conn.user.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                          alt="" 
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <span className="text-sm font-medium text-white">{conn.user.name}</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedForwardTargets(prev => prev.filter(id => id !== conn.user._id));
                          } else {
                            setSelectedForwardTargets(prev => [...prev, conn.user._id]);
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-600 text-[#00F0FF] focus:ring-[#00F0FF]/50 bg-[#161616]"
                      />
                    </label>
                  );
                })}
                {forwardDisplayList.length === 0 && (
                  <div className="text-center text-xs text-gray-500 py-4">
                    {searchForwardQuery ? 'No connections found' : 'No active chats available to share with'}
                  </div>
                )}
              </div>

              {/* Text comment field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Add a message if you like</label>
                <textarea 
                  value={forwardComment}
                  onChange={(e) => setForwardComment(e.target.value)}
                  placeholder="Type a message..."
                  rows={3}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F0FF]/50 resize-none custom-scrollbar"
                />
              </div>

              {/* Message preview block */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preview</label>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl max-w-full min-w-0">
                  {forwardTargetMessage.attachment && (
                    <div className="mb-2">
                      {forwardTargetMessage.attachment.type === 'image' ? (
                        <img src={forwardTargetMessage.attachment.url} alt="" className="max-w-[150px] rounded-lg object-contain border border-white/10" />
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5 w-fit max-w-full">
                          <FileText size={16} className="text-[#00F0FF] flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{forwardTargetMessage.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {forwardTargetMessage.text && (
                    <p className="text-sm text-gray-300 whitespace-pre-wrap truncate max-h-20 leading-relaxed">
                      {forwardTargetMessage.text}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex justify-between items-center bg-white/[0.01]">
              <button 
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-sm text-[#00F0FF] hover:underline font-semibold"
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowForwardModal(false);
                    setForwardTargetMessage(null);
                    setSelectedForwardTargets([]);
                    setForwardComment('');
                  }}
                  className="px-4 py-2 bg-transparent text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleForwardMessage}
                  disabled={selectedForwardTargets.length === 0 || forwardingInProgress}
                  className="px-5 py-2 bg-[#00F0FF] text-black hover:bg-[#00D0DF] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:shadow-none"
                >
                  {forwardingInProgress ? 'Forwarding...' : 'Forward'}
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default MessagesPage;
