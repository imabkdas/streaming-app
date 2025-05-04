package com.streamingapp.chatservice.dto;

public record ChatMessage(
        String sender,
        String text,
        long timestamp,
        String roomId,
        MessageType messageType  // NEW: USER_MESSAGE, JOIN, LEAVE
) {
    public enum MessageType {
        USER_MESSAGE, JOIN, LEAVE
    }
}

