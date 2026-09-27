package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    
    private String uploadedBy; // User ID
    private String name;
    private String category = "General";
    private String subcategory;
    
    // Location sub-document fields flattened or kept as nested class
    private String city = "Other";
    private String address;
    
    private String description;
    private String productImage;
    private List<String> additionalImages;
    private String productCondition;
    
    private Double rating = 0.0;
    private Integer reviewCount = 0;
    private Double price;
    private Integer durationDays = 0;
    private Boolean isBooked = false;
    
    private Date createdAt;
    private Date updatedAt;
}
