package dto;
import

public record ChatMessage {
    String user;
    String content;
    String timestamp;
    String roomid;
    MessageType messageType;
}
