import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import './Chat.css'; 


interface ChatMessage {
	roomId: string ;
	sender: string;
	text: string;
	timestamp: number;
	messageType: 'USER_MESSAGE' | 'LEAVE' | 'JOIN'
  }


interface ChatProps {
  messages: ChatMessage[];
  username: string; 
  onSendMessage: (messageText: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, username, onSendMessage }) => {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null); // Ref for the picker container
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
	}, [messages])

  
	const handleSendMessage = (e: FormEvent) => {
		e.preventDefault();
		if (messageInput.trim()) { 
			onSendMessage(messageInput.trim()); 
			setMessageInput('');
			setShowEmojiPicker(false);
		}
	};

 
	const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
		setMessageInput((prevInput) => prevInput + emojiData.emoji);
	};


	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
		if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
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
	}, []); 

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
					<div key={`${msg.timestamp}-${msg.sender}-${Math.random()}`} className={`message-item ${msg.sender === username ? 'sent' : 'received'}`}>
							<span className="message-sender">{msg.sender === username ? 'You' : msg.sender}:</span>
							<span className="message-text">{msg.text}</span>
					</div>
				))
			)}
		</div>

		<div className="chat-input-section"> 
			{showEmojiPicker && (
			<div ref={emojiPickerRef} className="emoji-picker-container">
				<EmojiPicker
				onEmojiClick={onEmojiClick}
				autoFocusSearch={false}
				theme={Theme.AUTO} 
				height={350} 
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