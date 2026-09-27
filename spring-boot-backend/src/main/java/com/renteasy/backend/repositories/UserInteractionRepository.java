package com.renteasy.backend.repositories;

import com.renteasy.backend.models.UserInteraction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserInteractionRepository extends MongoRepository<UserInteraction, String> {
}
