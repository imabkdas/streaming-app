import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
// Import the emoji picker component and types
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import './Chat.css'; // Import the CSS file

// Define the shape of a message
interface ChatMessage {
  id: string | number;
  sender: string;
  text: string;
  timestamp?: number; // Make timestamp optional for simplicity here
}

// Define the props the Chat component expects
interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (messageText: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  // Basic state for input field
  const [messageInput, setMessageInput] = useState('');
  // State to control emoji picker visibility (picker component not added yet)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null); // Ref for the picker container

  // Placeholder handler for sending messages
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) { // Check if message is not just whitespace
        onSendMessage(messageInput.trim()); // Call the handler passed via props
        setMessageInput('');
        setShowEmojiPicker(false);
    }
  };

  // Handler for when an emoji is clicked in the picker
  const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    setMessageInput((prevInput) => prevInput + emojiData.emoji);
  };

  // Close emoji picker if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        // Check if the click target was the emoji toggle button itself
        const emojiButton = document.querySelector('.emoji-button');
        if (!emojiButton || !emojiButton.contains(event.target as Node)) {
            setShowEmojiPicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
      </div>
      <div className="message-list">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message-item">
              <span className="message-sender">{msg.sender}:</span>
              <span className="message-text">{msg.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-section"> {/* Wrapper for picker and form */}
        {/* Conditionally render the Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="emoji-picker-container">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              autoFocusSearch={false}
              theme={Theme.AUTO} // Or Theme.LIGHT / Theme.DARK
              height={350} // Adjust height as needed
              width="100%"
            />
          </div>
        )}

        <form className="message-input-form" onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            <input
              type="text"
              className="message-input"
              value={messageInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              // Consider removing onFocus handler if clicking outside closes picker
              // onFocus={() => setShowEmojiPicker(false)}
            />
            <button
              type="button"
              className="emoji-button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Select emoji"
            >
              😊
            </button>
          </div>
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;