package com.renteasy.backend.services;

import com.renteasy.backend.models.Rental;
import com.renteasy.backend.repositories.RentalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RentalService {

    @Autowired
    private RentalRepository repository;

    public List<Rental> findAll() {
        return repository.findAll();
    }

    public Optional<Rental> findById(String id) {
        return repository.findById(id);
    }

    public Rental save(Rental entity) {
        return repository.save(entity);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
