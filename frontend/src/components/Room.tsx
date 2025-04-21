import React, { useState } from 'react';
import Chat from './Chat';
import './Room.css'; // Import CSS for Room layout

// Dummy types for placeholder props
interface ChatMessage {
    id: string | number;
    sender: string;
    text: string;
    timestamp: number;
}

const Room = () => {
    // Placeholder state for chat messages
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, sender: 'Alice', text: 'Hi Bob! 😊', timestamp: Date.now() - 20000 },
        { id: 2, sender: 'Bob', text: 'Hello Alice! 👋 How are you?', timestamp: Date.now() - 10000 },
        { id: 3, sender: 'Alice', text: 'Doing well, thanks! 👍', timestamp: Date.now() },
    ]);

    // Placeholder handler for sending messages
    const handleSendMessage = (messageText: string) => {
        console.log('Room received message to send:', messageText);
        const newMessage: ChatMessage = {
            id: Date.now(), // Simple ID for example
            sender: 'Me', // Replace with actual username
            text: messageText,
            timestamp: Date.now()
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        // TODO: Send message via WebSocket connection
    };

    return (
        <div className="room-container"> 
            <div className="video-area"> 
                {/* Placeholder for the video player */}
                <h2>Video Player Area</h2>
                <p>(Video player component will go here)</p>
            </div>
            <div className="chat-area"> 
                <Chat messages={messages} onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default Room;