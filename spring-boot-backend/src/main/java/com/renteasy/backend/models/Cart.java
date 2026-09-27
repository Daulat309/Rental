package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "carts")
public class Cart {
    @Id
    private String id;
    
    private String user; // User ID
    private List<CartItem> items;
    
    private Date createdAt;
    private Date updatedAt;
    
    @Data
    public static class CartItem {
        private String product; // Product ID
        private Integer quantity = 1;
    }
}
