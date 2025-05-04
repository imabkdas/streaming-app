package com.streamingapp.chatservice.controller;

import com.streamingapp.chatservice.config.WebSocketEventListener;
import com.streamingapp.chatservice.dto.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Date;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final SimpMessagingTemplate messagingTemplate;
    private final ConcurrentHashMap<String, Set<String>> activeUsers;
    private final WebSocketEventListener webSocketEventListener;

    public ChatController(SimpMessagingTemplate simpMessagingTemplate,
                          WebSocketEventListener webSocketEventListener,
                          ConcurrentHashMap<String, Set<String>> activeUsers) {
        this.messagingTemplate = simpMessagingTemplate;
        this.webSocketEventListener = webSocketEventListener;
        this.activeUsers = activeUsers;
    }

    // --- Remove SIMPLIFIED SEND METHOD ---
    // @MessageMapping("/chat/send") // Simplified path, no roomId variable
    // public void simpleSendMessage(@Payload String rawPayload) { // Simple String payload
    //     log.info("***** RECEIVED simpleSendMessage! Payload: {}", rawPayload);
    //     // Can't easily broadcast without room info/original message object
    // }
    // -------------------------------------

    @MessageMapping("/chat/{roomId}/send")
    // Restore @DestinationVariable and broadcast logic
    public void sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        log.info("Received message for room {}: {}", roomId, chatMessage);
        // Restore broadcast logic
        messagingTemplate.convertAndSend("/topic/room-"+ roomId, chatMessage);
    }

    @MessageMapping("/chat/{roomId}/join")
    public void joinRoom(@Payload ChatMessage joinMessage, @Header("simpSessionId") String sessionId){
        log.info("Received join request for room {}: {} (Session: {})", joinMessage.roomId(), joinMessage, sessionId);

        webSocketEventListener.registerSession(sessionId, joinMessage.sender(), joinMessage.roomId());

        activeUsers.computeIfAbsent(joinMessage.roomId(), k -> ConcurrentHashMap.newKeySet())
                .add(joinMessage.sender());

        messagingTemplate.convertAndSend("/topic/room-" + joinMessage.roomId(), joinMessage);
        log.info("Broadcasted JOIN message for sender {} to room {}", joinMessage.sender(), joinMessage.roomId());
    }

    @MessageMapping("/chat/{roomId}/leave")
    public void leaveRoom(@Payload ChatMessage leaveMessage, @Header("simpSessionId") String sessionId){
        log.info("Received explicit leave request for room {}: {} (Session: {})", leaveMessage.roomId(), leaveMessage, sessionId);
        if (activeUsers.containsKey(leaveMessage.roomId())){
            activeUsers.get(leaveMessage.roomId()).remove(leaveMessage.sender());
            messagingTemplate.convertAndSend("/topic/room-" + leaveMessage.roomId(), leaveMessage);
            log.info("Broadcasted explicit LEAVE message for sender {} to room {}", leaveMessage.sender(), leaveMessage.roomId());
            if(activeUsers.get(leaveMessage.roomId()).isEmpty()){
                log.info("Room {} is now empty after explicit leave, removing.", leaveMessage.roomId());
                activeUsers.remove(leaveMessage.roomId());
            }
        }
    }

    // --- Remove Simple Ping Test Method ---
    // @MessageMapping("/ping") // Simple, non-parameterized path
    // public void handlePing(@Payload String payload) { // Accept a simple String payload
    //     log.info("***** RECEIVED PING! Payload: {}", payload);
    //     // Optionally send a reply
    //     // messagingTemplate.convertAndSend("/topic/ping-replies", "PONG: " + payload);
    // }
    // ------------------------------------
}
