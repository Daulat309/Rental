package com.renteasy.backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String fullName;
    private String email;
    private String mobileNumber;
    private Boolean isGoogleAuth = false;
    private String salt;
    private String password;
    private String profileImage = "/images/avatar.png";
    
    // Using String for role, could use an Enum
    private String role = "USER";
    private Boolean isEmailVerified = false;
    
    private String otp;
    private Date otpExpires;
    private Boolean isTemporary = false;
    
    // Timestamps can be managed by Spring Data @CreatedDate, @LastModifiedDate
    private Date createdAt;
    private Date updatedAt;
}
