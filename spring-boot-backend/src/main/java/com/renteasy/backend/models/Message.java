package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    
    private String conversationId;
    private String senderId;
    private String receiverId;
    
    private String text;
    private Boolean readStatus = false;
    
    // Enum: "text", "image", "system"
    private String messageType = "text";
    
    private Date createdAt;
    private Date updatedAt;
}
