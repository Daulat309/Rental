package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "conversations")
public class Conversation {
    @Id
    private String id;
    
    private List<String> participants; // User IDs
    private String productId; // Product ID, can be null
    
    private LastMessage lastMessage;
    private java.util.Map<String, Integer> unreadCount; // User ID -> Count
    
    private Date createdAt;
    private Date updatedAt;
    
    @Data
    public static class LastMessage {
        private String text = "";
        private String senderId;
        private Date timestamp = new Date();
    }
}
