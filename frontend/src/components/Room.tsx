import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Chat from './Chat';
import {connect, disconnect, sendMessage} from '../services/WebSocket';
import './Room.css';

// Revert ChatMessage interface (remove id, status)
interface ChatMessage {
    // id?: string;
    // status?: 'pending' | 'delivered' | 'failed';
    roomId: string ;
    sender: string;
    text: string;
    timestamp: number;
    messageType: 'USER_MESSAGE' | 'LEAVE' | 'JOIN';
  }

const Room = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [username] = useState('User_' + Math.floor(Math.random() * 1000));
    const { roomId } = useParams<{ roomId: string }>();

    useEffect(() => {
        if (!roomId) return;

        connect(roomId, username, (newMessage: ChatMessage) => {
            // Simplified message receiving logic
            setMessages(prevMessages => {
                 // Simple check to prevent adding the exact same message object if received immediately
                 // More robust checks might compare timestamp/sender/text if needed
                 const isDuplicate = prevMessages.some(msg =>
                    msg.timestamp === newMessage.timestamp &&
                    msg.sender === newMessage.sender &&
                    msg.text === newMessage.text
                 );

                 if (!isDuplicate) {
                    return [...prevMessages, newMessage];
                 } else {
                    console.log("Likely duplicate message ignored:", newMessage);
                    return prevMessages;
                 }
            });
        });

        return () => {
            disconnect();
        }
    },[roomId, username]);

    const handleSendMessage = (messageText: string) => {
        if (!roomId) return;

        // Remove messageId generation
        // const messageId = uuidv4();
        const message: ChatMessage = {
            // Remove id and status
            // id: messageId,
            // status: 'pending',
            roomId: roomId,
            sender: username,
            text: messageText,
            timestamp: Date.now(),
            messageType: 'USER_MESSAGE'
        };

        // Remove optimistic message add
        // setMessages(prev => [...prev, message]);

        // Send the message object (without id/status) via WebSocket
        sendMessage(roomId, message);
    };

    if (!roomId) {
        return <div>Loading room...</div>;
    }

    return (
        <div className="room-container">
            <div className="video-area">
                <h2>Video Player Area (Room: {roomId})</h2>
                <p>Your Username: {username}</p>
                <p>(Video player component will go here)</p>
            </div>
            <div className="chat-area">
                <Chat messages={messages} username={username} onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default Room;