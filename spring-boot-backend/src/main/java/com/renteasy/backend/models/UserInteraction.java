package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "userInteractions")
public class UserInteraction {
    @Id
    private String id;
    
    private String userId;
    private String productId;
    
    // Enum: 'VIEW', 'RENT', 'WISHLIST', 'SEARCH'
    private String interactionType;
    
    private String searchQuery;
    private Integer rentalDuration;
    
    private Date interactionTime = new Date();
    
    private Date createdAt;
    private Date updatedAt;
}
