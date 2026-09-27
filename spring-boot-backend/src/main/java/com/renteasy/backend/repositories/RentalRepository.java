package com.renteasy.backend.repositories;

import com.renteasy.backend.models.Rental;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentalRepository extends MongoRepository<Rental, String> {
}
