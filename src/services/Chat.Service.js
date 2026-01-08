import axios from 'axios';

const CHAT_STORAGE_KEY = 'chat_history_local';

// Tạo hoặc lấy sessionId từ localStorage
export const getSessionId = () => {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

// Lấy lịch sử chat từ localStorage
export const getChatHistory = () => {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading chat history from localStorage:', error);
    return [];
  }
};

// Lưu lịch sử chat vào localStorage
export const saveChatHistory = (messages) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving chat history to localStorage:', error);
  }
};

// Gửi tin nhắn (vẫn cần backend để xử lý AI)
export const sendMessage = async (sessionId, text, recentMessages = []) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/chat/message`,
      { 
        text, 
        sessionId,
        recentMessages: recentMessages.map(msg => ({
          text: msg.text,
          sender: msg.sender
        }))
      }
    );
    return res.data;
  } catch (error) {
    console.error('Error sending message:', error);
    return { 
      status: 'ERROR',
      message: error?.response?.data?.message || 'Lỗi khi gửi tin nhắn'
    };
  }
};

