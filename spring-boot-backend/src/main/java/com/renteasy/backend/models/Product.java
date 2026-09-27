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
    
    // TODO: Add fields translated from product.js
}
