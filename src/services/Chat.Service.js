import axios from 'axios';

// Tạo hoặc lấy sessionId từ sessionStorage
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

// Lấy lịch sử chat
export const getChatHistory = async (sessionId) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/chat/history?sessionId=${sessionId}`
    );
    return res.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { 
      status: 'ERROR', 
      data: null,
      message: error?.response?.data?.message || 'Lỗi khi tải lịch sử chat'
    };
  }
};

// Gửi tin nhắn
export const sendMessage = async (sessionId, text) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/chat/message`,
      { text, sessionId }
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

