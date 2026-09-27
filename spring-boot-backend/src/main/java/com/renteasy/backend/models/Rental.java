package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "rentals")
public class Rental {
    @Id
    private String id;
    
    private String product; // Product ID
    private String renter; // User ID
    private String owner; // User ID
    
    private Date startDate;
    private Date endDate;
    private Double totalPrice;
    
    // Enum: 'pending', 'approved', 'cancelled', 'completed'
    private String status = "pending";
    private String cancelledBy; // User ID
    
    private Date createdAt;
    private Date updatedAt;
}
