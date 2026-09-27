package com.renteasy.backend.services;

import com.renteasy.backend.models.UserInteraction;
import com.renteasy.backend.repositories.UserInteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserInteractionService {

    @Autowired
    private UserInteractionRepository repository;

    public List<UserInteraction> findAll() {
        return repository.findAll();
    }

    public Optional<UserInteraction> findById(String id) {
        return repository.findById(id);
    }

    public UserInteraction save(UserInteraction entity) {
        return repository.save(entity);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
