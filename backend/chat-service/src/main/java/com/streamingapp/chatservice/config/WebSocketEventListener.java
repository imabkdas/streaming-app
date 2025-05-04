package com.streamingapp.chatservice.config;

import com.streamingapp.chatservice.dto.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.Map; 
import java.util.Set; 
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ConcurrentHashMap<String, UserSessionInfo> activeSessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<String>> activeUsers;
    private final TaskScheduler taskScheduler;

    // Assuming UserSessionInfo holds username and roomId
    // You might need to create this simple record/class
    // public record UserSessionInfo(String username, String roomId) {}

    public WebSocketEventListener(SimpMessagingTemplate messagingTemplate,
                                  ConcurrentHashMap<String, Set<String>> activeUsers,
                                  TaskScheduler taskScheduler) {
        this.messagingTemplate = messagingTemplate;
        this.activeUsers = activeUsers; 
        this.taskScheduler = taskScheduler;
    }

    // Method to register a user session 
    public void registerSession(String sessionId, String username, String roomId) {
        if (sessionId != null && username != null && roomId != null) {
            activeSessions.put(sessionId, new UserSessionInfo(username, roomId));
            log.info("Session registered: {} -> User: {}, Room: {}", sessionId, username, roomId);
        } else {
             log.warn("Attempted to register session with null values. SessionId: {}, Username: {}, RoomId: {}", sessionId, username, roomId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (sessionId != null) {
            UserSessionInfo sessionInfo = activeSessions.remove(sessionId); 

            if (sessionInfo != null) {
                String username = sessionInfo.username();
                String roomId = sessionInfo.roomId();
                log.info("User disconnected: SessionId={}, Username={}, RoomId={}", sessionId, username, roomId);

                // Clean up activeUsers map
                if (activeUsers.containsKey(roomId)) {
                    activeUsers.get(roomId).remove(username);
                    log.info("Removed {} from active users in room {}", username, roomId);
                     if(activeUsers.get(roomId).isEmpty()){
                        log.info("Room {} is now empty, removing.", roomId);
                        activeUsers.remove(roomId);
                    }
                }

                // Schedule the broadcast with a small delay
                taskScheduler.schedule(() -> {
                    ChatMessage leaveMessage = new ChatMessage(
                            username,
                            username + " left the chat",
                            System.currentTimeMillis(),
                            roomId,
                            ChatMessage.MessageType.LEAVE
                    );
                    messagingTemplate.convertAndSend("/topic/room-" + roomId, leaveMessage);
                    log.info("Broadcasted LEAVE message for {} from disconnected session {} to room {} (after delay)", 
                             username, sessionId, roomId);
                }, Instant.now().plusMillis(100));

            } else {
                 log.warn("Disconnect event received for unknown session ID: {}", sessionId);
            }
        } else {
            log.error("SessionDisconnectEvent received without a session ID: {}", event);
        }
    }

    public record UserSessionInfo(String username, String roomId) {}
} 