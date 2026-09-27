import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import {
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  User,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";

const BASE_URL = "http://localhost:5000";

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const joinedRoomsRef = useRef(new Set()); // Track joined rooms to prevent re-joining
  const processedNavigationRef = useRef(false); // Track if we've handled navigation state

  // Get token from localStorage or cookies
  const getToken = () => {
    // Try localStorage first
    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;
    
    // Fallback to cookies
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    return cookieToken;
  };

  const normalizeUserId = (payload = {}) => {
    const userId = payload.userId || payload.odId || payload.id || payload._id;
    return userId ? String(userId) : null;
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    
    if (!userStr) {
      setLoading(false);
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userStr);
      // Check for _id or id
      const userId = parsedUser._id || parsedUser.id;
      if (userId) {
        // Store user with normalized _id
        setCurrentUser({ ...parsedUser, _id: userId });
      }
    } catch (e) {
      console.error("Chat - Error parsing user:", e);
    }
  }, []);
  
  const token = getToken();

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!currentUser || !token) return;

    const newSocket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      // Clear joined rooms on disconnect so we re-join on reconnect
      joinedRoomsRef.current.clear();
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setIsConnected(false);
    });

    // Handle receiving new messages
    newSocket.on("receiveMessage", (message) => {
      setMessages((prev) => {
        // Avoid duplicates (check both real IDs and replace optimistic messages)
        const existingIndex = prev.findIndex((m) => m._id === message._id);
        if (existingIndex !== -1) return prev;
        
        // Check if there's an optimistic message with same text from same sender to replace
        const optimisticIndex = prev.findIndex(
          (m) => m.isOptimistic && 
                 m.text === message.text && 
                 (m.senderId._id === message.senderId._id || m.senderId._id === message.senderId)
        );
        
        if (optimisticIndex !== -1) {
          // Replace optimistic message with real one
          const newMessages = [...prev];
          newMessages[optimisticIndex] = message;
          return newMessages;
        }
        
        return [...prev, message];
      });
      scrollToBottom();
    });

    // Handle new message notification (for updating chat list)
    newSocket.on("newMessage", ({ conversation, message }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversation._id
            ? {
                ...conv,
                lastMessage: conversation.lastMessage,
                unreadCount:
                  activeConversation?._id === conv._id
                    ? 0
                    : conversation.unreadCount,
              }
            : conv
        )
      );
    });

    // Handle typing indicators
    newSocket.on("userTyping", (payload) => {
      const userId = normalizeUserId(payload);
      if (!userId) return;

      setTypingUsers((prev) => ({
        ...prev,
        [userId]: payload.isTyping,
      }));
    });

    // Handle online/offline status
    newSocket.on("onlineUsers", ({ userIds = [] }) => {
      setOnlineUsers(new Set(userIds.map(String)));
    });

    newSocket.on("userOnline", (payload) => {
      const userId = normalizeUserId(payload);
      if (!userId) return;

      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on("userOffline", (payload) => {
      const userId = normalizeUserId(payload);
      if (!userId) return;

      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Handle messages read
    newSocket.on("messagesRead", ({ conversationId, readBy }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId._id === currentUser?._id || msg.senderId === currentUser?._id
              ? { ...msg, readStatus: true }
              : msg
          )
        );
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, currentUser]);

  // Re-join active conversation when socket reconnects
  useEffect(() => {
    if (socket && isConnected && activeConversation && !joinedRoomsRef.current.has(activeConversation._id)) {
      socket.emit("joinChat", activeConversation._id);
      joinedRoomsRef.current.add(activeConversation._id);
    }
  }, [socket, isConnected, activeConversation]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/chat/conversations`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized, but staying on page");
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch conversations when logged in
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [currentUser, fetchConversations]);

  // Handle conversation from navigation state (e.g., from "Chat with Owner")
  useEffect(() => {
    if (location.state?.conversationId && !processedNavigationRef.current) {
      const convId = location.state.conversationId;
      // Find the conversation in the list or fetch it
      const existingConv = conversations.find((c) => c._id === convId);
      if (existingConv) {
        processedNavigationRef.current = true; // Mark as processed
        handleSelectConversation(existingConv);
        // Clear the navigation state to prevent re-processing
        navigate(location.pathname, { replace: true, state: {} });
      } else if (!loading && conversations.length > 0) {
        // Conversations loaded but this one isn't in the list - fetch it
        processedNavigationRef.current = true;
        fetchConversationById(convId);
      }
    }
  }, [location.state, conversations, loading, navigate]);

  const fetchConversationById = async (convId) => {
    try {
      const response = await fetch(`${BASE_URL}/chat/messages/${convId}`, {
        credentials: "include",
      });

      if (response.ok) {
        // Refetch all conversations to include this one
        fetchConversations();
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(
        `${BASE_URL}/chat/messages/${conversationId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Handle selecting a conversation
  const handleSelectConversation = (conversation) => {
    // Don't re-select if already active
    if (activeConversation?._id === conversation._id) return;
    
    setActiveConversation(conversation);
    fetchMessages(conversation._id);

    // Join the chat room via socket (only if not already joined)
    if (socket && isConnected && !joinedRoomsRef.current.has(conversation._id)) {
      socket.emit("joinChat", conversation._id);
      joinedRoomsRef.current.add(conversation._id);
    }

    // Reset unread count for this conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
      )
    );

    // Focus on message input
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeConversation || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);

    try {
      // Create optimistic message to show immediately
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversationId: activeConversation._id,
        senderId: { _id: currentUser._id, fullName: currentUser.fullName },
        receiverId: activeConversation.otherUser._id,
        text: messageText,
        readStatus: false,
        createdAt: new Date().toISOString(),
        isOptimistic: true, // Flag to identify optimistic messages
      };
      
      // Add optimistic message immediately
      setMessages((prev) => [...prev, optimisticMessage]);
      scrollToBottom();
      
      if (socket && isConnected) {
        // Send via socket for real-time delivery
        socket.emit("sendMessage", {
          conversationId: activeConversation._id,
          receiverId: activeConversation.otherUser._id,
          text: messageText,
        });
      } else {
        // Fallback to REST API
        const response = await fetch(`${BASE_URL}/chat/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            conversationId: activeConversation._id,
            receiverId: activeConversation.otherUser._id,
            text: messageText,
          }),
        });

        if (response.ok) {
          const message = await response.json();
          // Replace optimistic message with real one
          setMessages((prev) => 
            prev.map((m) => m._id === optimisticMessage._id ? message : m)
          );
          scrollToBottom();
        }
      }

      // Update last message in conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === activeConversation._id
            ? {
                ...conv,
                lastMessage: {
                  text: messageText,
                  senderId: currentUser?._id,
                  timestamp: new Date(),
                },
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !activeConversation) return;

    socket.emit("typing", {
      conversationId: activeConversation._id,
      isTyping: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        conversationId: activeConversation._id,
        isTyping: false,
      });
    }, 2000);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Format timestamp
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString();
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser?.fullName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  if (!currentUser) {
    return (
      <div className="h-[calc(100vh-65px)] bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Please Login to Chat</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to access your messages.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#1399c6] text-white px-6 py-2 rounded-lg hover:bg-[#0f85ad] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] bg-gray-100 flex">
      {/* Left Panel - Conversation List */}
      <div
        className={`w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col ${
          activeConversation ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#1399c6] flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Messages
          </h1>
          {/* Search */}
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1399c6]"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 text-[#1399c6] animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Previous Chats Found
              </h3>
              <p className="text-gray-500 text-sm max-w-xs">
                You haven't started any conversations yet. Visit a product page and click "Chat with Owner" to start chatting!
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  activeConversation?._id === conversation._id
                    ? "bg-[#1399c6]/10"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  {conversation.otherUser?.profileImage ? (
                    <img
                      src={conversation.otherUser.profileImage}
                      alt={conversation.otherUser.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1399c6]/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#1399c6]" />
                    </div>
                  )}
                  {/* Online indicator */}
                  {onlineUsers.has(String(conversation.otherUser?._id)) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* Conversation Info */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.otherUser?.fullName || "Unknown User"}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {conversation.lastMessage?.timestamp
                        ? formatTime(conversation.lastMessage.timestamp)
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.text || "Start a conversation"}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 bg-[#1399c6] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat Window */}
      <div
        className={`flex-1 flex flex-col bg-gray-50 ${
          !activeConversation ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center p-4 bg-white border-b border-gray-200">
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden mr-3 p-1 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>

              {/* User Avatar */}
              <div className="relative">
                {activeConversation.otherUser?.profileImage ? (
                  <img
                    src={activeConversation.otherUser.profileImage}
                    alt={activeConversation.otherUser.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1399c6]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1399c6]" />
                  </div>
                )}
                {onlineUsers.has(String(activeConversation.otherUser?._id)) && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="ml-3">
                <h2 className="font-semibold text-gray-900">
                  {activeConversation.otherUser?.fullName || "Unknown User"}
                </h2>
                <p className="text-xs text-gray-500">
                  {onlineUsers.has(String(activeConversation.otherUser?._id))
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-[#1399c6] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation!</p>
                </div>
              ) : (
                Object.entries(groupMessagesByDate(messages)).map(
                  ([date, dateMessages]) => (
                    <div key={date}>
                      {/* Date Separator */}
                      <div className="flex items-center justify-center my-4">
                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {date}
                        </span>
                      </div>

                      {/* Messages */}
                      {dateMessages.map((message) => {
                        const isOwnMessage =
                          (message.senderId._id || message.senderId) ===
                          currentUser?._id;

                        return (
                          <div
                            key={message._id}
                            className={`flex ${
                              isOwnMessage ? "justify-end" : "justify-start"
                            } mb-3`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                isOwnMessage
                                  ? "bg-[#1399c6] text-white rounded-br-md"
                                  : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                              }`}
                            >
                              <p className="break-words">{message.text}</p>
                              <div
                                className={`flex items-center justify-end gap-1 mt-1 ${
                                  isOwnMessage ? "text-white/70" : "text-gray-400"
                                }`}
                              >
                                <span className="text-xs">
                                  {formatTime(message.createdAt)}
                                </span>
                                {isOwnMessage && (
                                  <span>
                                    {message.readStatus ? (
                                      <CheckCheck className="w-4 h-4" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )
              )}

              {/* Typing Indicator */}
              {typingUsers[String(activeConversation.otherUser?._id)] && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 px-4 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-gray-200"
            >
              <div className="flex items-center gap-3">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#1399c6] focus:ring-1 focus:ring-[#1399c6]"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className={`p-3 rounded-full transition-colors ${
                    newMessage.trim() && !sendingMessage
                      ? "bg-[#1399c6] text-white hover:bg-[#1399c6]/90"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {sendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageCircle className="w-20 h-20 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-600">
              Select a conversation
            </h2>
            <p className="text-sm mt-2">
              Choose a chat from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
