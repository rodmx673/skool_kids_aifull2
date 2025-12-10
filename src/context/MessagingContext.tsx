
"use client";

import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';

export type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isSystemMessage?: boolean;
  readBy: string[]; // Array of user IDs who have read the message
};

export type Conversation = {
  userId: string; // The ID of the other user in the conversation
  messages: Message[];
};

type MessagingContextType = {
  conversations: Conversation[];
  getConversation: (userId: string) => Conversation | undefined;
  sendMessage: (recipientId: string, text: string, senderId: string) => void;
  sendSystemMessage: (recipientId: string, text: string) => void;
  getUnreadConversationsCount: (currentUserId: string) => number;
  markConversationAsRead: (conversationUserId: string, currentUserId: string) => void;
};

export const MessagingContext = createContext<MessagingContextType>({
  conversations: [],
  getConversation: () => undefined,
  sendMessage: () => {},
  sendSystemMessage: () => {},
  getUnreadConversationsCount: () => 0,
  markConversationAsRead: () => {},
});

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedConversations = window.localStorage.getItem('datalake-messaging');
      if (storedConversations) {
        // Ensure readBy array exists on all messages
        const parsedConvos = JSON.parse(storedConversations).map((convo: Conversation) => ({
          ...convo,
          messages: convo.messages.map(msg => ({ ...msg, readBy: msg.readBy || [] }))
        }));
        setConversations(parsedConvos);
      }
    } catch (error) {
      console.error("Error reading conversations from localStorage", error);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      window.localStorage.setItem('datalake-messaging', JSON.stringify(conversations));
    } catch (error) {
      console.error("Error writing conversations to localStorage", error);
    }
  }, [conversations, isInitialLoad]);

  const modifyConversation = (recipientId: string, message: Message) => {
    setConversations(prev => {
      const convoIndex = prev.findIndex(c => c.userId === recipientId);
      if (convoIndex > -1) {
        const updatedConvo = {
          ...prev[convoIndex],
          messages: [...prev[convoIndex].messages, message],
        };
        const newConvos = [...prev];
        newConvos[convoIndex] = updatedConvo;
        return newConvos;
      } else {
        const newConvo: Conversation = {
          userId: recipientId,
          messages: [message],
        };
        return [...prev, newConvo];
      }
    });
  };

  const sendMessage = (recipientId: string, text: string, senderId: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      senderId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readBy: [senderId], // The sender has "read" it
    };
    modifyConversation(recipientId, newMessage);
  };

  const sendSystemMessage = (recipientId: string, text: string) => {
    const systemMessage: Message = {
        id: `sys-msg-${Date.now()}`,
        text,
        senderId: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystemMessage: true,
        readBy: [],
    };
    modifyConversation(recipientId, systemMessage);
  };
  
  const getConversation = (userId: string) => {
    return conversations.find(c => c.userId === userId);
  };
  
  const getUnreadConversationsCount = (currentUserId: string): number => {
    if (!currentUserId) return 0;
    
    return conversations.reduce((count, convo) => {
      const hasUnread = convo.messages.some(msg => msg.senderId !== currentUserId && !msg.readBy.includes(currentUserId));
      return hasUnread ? count + 1 : count;
    }, 0);
  };
  
  const markConversationAsRead = (conversationUserId: string, currentUserId: string) => {
    setConversations(prev =>
      prev.map(convo => {
        if (convo.userId === conversationUserId) {
          return {
            ...convo,
            messages: convo.messages.map(msg => {
              if (!msg.readBy.includes(currentUserId)) {
                return { ...msg, readBy: [...msg.readBy, currentUserId] };
              }
              return msg;
            }),
          };
        }
        return convo;
      })
    );
  };

  return (
    <MessagingContext.Provider value={{ conversations, getConversation, sendMessage, sendSystemMessage, getUnreadConversationsCount, markConversationAsRead }}>
      {children}
    </MessagingContext.Provider>
  );
};
