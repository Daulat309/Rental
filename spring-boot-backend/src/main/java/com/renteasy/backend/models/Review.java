package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "reviews")
public class Review {
    @Id
    private String id;
    
    private String product; // Product ID
    private String user; // User ID
    
    private Integer rating;
    private String comment;
    private List<String> images;
    
    private Boolean isVerifiedRent = false;
    
    private Date createdAt;
    private Date updatedAt;
}
