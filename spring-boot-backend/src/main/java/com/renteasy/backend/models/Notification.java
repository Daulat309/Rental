package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    
    private String recipient;
    private String title;
    private String message;
    private String rentalId;
    private String productId;
    
    // Enum: 'rental_request', 'rental_approved', 'rental_rejected', 'rental_cancelled', 
    // 'rental_starting_soon', 'rental_ending_soon', 'rental_completed', 'rental_reminder'
    private String type;
    private Boolean isRead = false;
    
    private Date createdAt;
    private Date updatedAt;
}
