import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';

let stompClient : Client | null;

export const connect = (
    roomId: String,
    username: String,
    onMessageReceived: (message : any) => void
) => {

    const socket = new SockJS('http://localhost:8080/ws-chat');

    stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect : () => {
                stompClient?.subscribe(`/topic/room-${roomId}`, (message) =>{
                    let parsedMessage = JSON.parse(message.body);
                    onMessageReceived(parsedMessage);
                });

                stompClient?.publish({
                    destination: `/app/chat/${roomId}/join`, 
                    body: JSON.stringify({
                        roomId : roomId,
                        sender: username,
                        text: `${username} joined the chat`,
                        timestamp: Date.now(),
                        messageType: 'JOIN'
                    })
                });
            },

            reconnectDelay: 5000,
        }); 

    stompClient.activate();
}

export const sendMessage = (roomId: String, message: any) => {
    if(stompClient?.connected){
        const destination = `/app/chat/${roomId}/send`;
        const body = JSON.stringify(message);
        console.log('Sending message:', message, 'to destination:', destination);
        stompClient.publish({
            destination: destination,
            body: body,
        });
    }
}

export const disconnect = () => {
    stompClient?.deactivate();
}