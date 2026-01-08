import React, { useState, useRef, useEffect } from 'react';
import { MessageOutlined, CloseOutlined, SendOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as ChatService from '../../services/Chat.Service';
import './ChatWidget.scss';

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => ChatService.getSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick suggestions - câu hỏi sẵn
  const suggestions = [
    'Tư vấn nước hoa từ 1.5 - 3 triệu',
    'Tư vấn nước hoa mùi hoa ngọt, lưu hương vừa',
    'Tư vấn nước hoa giới tính nữ',
    'Top nước hoa lưu hương lâu cho nữ văn phòng, tông hoa nhẹ'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history từ localStorage khi mở chat
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Lưu messages vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      ChatService.saveChatHistory(messages);
    }
  }, [messages]);

  // Load lịch sử chat từ localStorage
  const loadChatHistory = () => {
    const storedMessages = ChatService.getChatHistory();
    
    if (storedMessages && storedMessages.length > 0) {
      setMessages(storedMessages);
    } else {
      // Nếu chưa có lịch sử, hiển thị message chào mặc định
      const welcomeMessage = [{
        id: 1,
        text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
        sender: 'bot',
        timestamp: new Date()
      }];
      setMessages(welcomeMessage);
      ChatService.saveChatHistory(welcomeMessage);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Kiểm tra xem có tin nhắn từ user chưa
  const hasUserMessages = messages.some(msg => msg.sender === 'user');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // Optimistic update: hiển thị tin nhắn user ngay
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      // Lấy recent messages để gửi lên backend cho AI context (bao gồm cả products)
      const recentMessages = messages.slice(-8).map(msg => ({
        text: msg.text,
        sender: msg.sender,
        products: msg.products || [] // Gửi kèm products để backend biết sản phẩm đã được gợi ý
      }));
      
      // Gọi API backend để lấy AI response
      const res = await ChatService.sendMessage(sessionId, messageText, recentMessages);
      
      if (res.status === 'OK' && res.data) {
        // Hiển thị bot response từ backend
        const botMessage = {
          id: Date.now() + 1,
          text: res.data.botMessage || res.data.message || 'Đã nhận được tin nhắn của bạn!',
          sender: 'bot',
          timestamp: new Date(),
          products: res.data.products || [] // Lưu products để hiển thị links
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Nếu có lỗi, hiển thị message lỗi
        const errorMessage = {
          id: Date.now() + 1,
          text: res.message || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi click vào suggestion
  const handleSuggestionClick = async (suggestion) => {
    if (isLoading) return;

    // Optimistic update
    const userMessage = {
      id: Date.now(),
      text: suggestion,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      // Lấy recent messages để gửi lên backend cho AI context (bao gồm cả products)
      const recentMessages = messages.slice(-8).map(msg => ({
        text: msg.text,
        sender: msg.sender,
        products: msg.products || [] // Gửi kèm products để backend biết sản phẩm đã được gợi ý
      }));
      
      // Gọi API backend để lấy AI response
      const res = await ChatService.sendMessage(sessionId, suggestion, recentMessages);
      
      if (res.status === 'OK' && res.data) {
        const botMessage = {
          id: Date.now() + 1,
          text: res.data.botMessage || res.data.message || 'Đã nhận được tin nhắn của bạn!',
          sender: 'bot',
          timestamp: new Date(),
          products: res.data.products || [] // Lưu products để hiển thị links
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: res.message || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending suggestion:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-widget">
      {!isOpen && (
        <button className="chat-widget__button" onClick={handleToggle}>
          <MessageOutlined className="chat-widget__icon" />
          <span className="chat-widget__badge" />
        </button>
      )}

      {isOpen && (
        <div className="chat-widget__box">
          <div className="chat-widget__header">
            <div className="chat-widget__header-info">
              <CustomerServiceOutlined className="chat-widget__header-icon" />
              <div>
                <h3 className="chat-widget__header-title">Hỗ trợ khách hàng</h3>
                <p className="chat-widget__header-subtitle">Chúng tôi thường phản hồi trong vài phút</p>
              </div>
            </div>
            <button className="chat-widget__close" onClick={handleToggle}>
              <CloseOutlined />
            </button>
          </div>

          <div className="chat-widget__messages">
            {isLoading && messages.length === 0 ? (
              <div className="chat-widget__loading">Đang tải...</div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`chat-widget__message chat-widget__message--${message.sender}`}
                  >
                    <div className="chat-widget__message-content">
                      <p className="chat-widget__message-text">{message.text}</p>
                      
                      {/* Hiển thị links sản phẩm nếu có - chỉ hiển thị sản phẩm được AI nhắc trong text */}
                      {message.sender === 'bot' && message.products && message.products.length > 0 && (() => {
                        // Parse tên sản phẩm từ bot message text
                        const messageText = message.text.toLowerCase();
                        const mentionedProducts = message.products.filter(product => {
                          const productName = product.name.toLowerCase();
                          // Kiểm tra xem tên sản phẩm có xuất hiện trong text không
                          return messageText.includes(productName);
                        });
                        
                        // Nếu không tìm thấy sản phẩm nào được nhắc, hiển thị tất cả (fallback)
                        const productsToShow = mentionedProducts.length > 0 
                          ? mentionedProducts.slice(0, 2) // Tối đa 2 sản phẩm được nhắc
                          : message.products.slice(0, 2); // Fallback: hiển thị 2 sản phẩm đầu
                        
                        return productsToShow.length > 0 ? (
                          <div className="chat-widget__products-links">
                            {productsToShow.map((product) => (
                              <button
                                key={product._id || product.slug}
                                className="chat-widget__product-link"
                                onClick={() => {
                                  navigate(`/product-details/${product.slug}`);
                                  setIsOpen(false);
                                }}
                              >
                                {product.name}
                              </button>
                            ))}
                          </div>
                        ) : null;
                      })()}
                      
                      <span className="chat-widget__message-time">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator khi AI đang trả lời */}
                {isLoading && messages.length > 0 && (
                  <div className="chat-widget__message chat-widget__message--bot">
                    <div className="chat-widget__message-content chat-widget__typing">
                      <span className="chat-widget__typing-dot" />
                      <span className="chat-widget__typing-dot" />
                      <span className="chat-widget__typing-dot" />
                    </div>
                  </div>
                )}
                
                {/* Quick Suggestions - chỉ hiển thị khi chưa có tin nhắn từ user */}
                {!hasUserMessages && !isLoading && (
                  <div className="chat-widget__suggestions">
                    <p className="chat-widget__suggestions-title">Bạn có thể hỏi:</p>
                    <div className="chat-widget__suggestions-list">
                      {suggestions.slice(0, 4).map((suggestion, index) => (
                        <button
                          key={index}
                          className="chat-widget__suggestion-item"
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isLoading}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-widget__input-container" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              className="chat-widget__input"
              placeholder="Nhập tin nhắn của bạn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              className="chat-widget__send-button"
              disabled={!inputMessage.trim() || isLoading}
            >
              <SendOutlined />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;

