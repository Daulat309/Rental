package com.renteasy.backend.repositories;

import com.renteasy.backend.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    java.util.Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
}
