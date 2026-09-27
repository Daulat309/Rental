package com.renteasy.backend.services;

import com.renteasy.backend.models.Conversation;
import com.renteasy.backend.repositories.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository repository;

    public List<Conversation> findAll() {
        return repository.findAll();
    }

    public Optional<Conversation> findById(String id) {
        return repository.findById(id);
    }

    public Conversation save(Conversation entity) {
        return repository.save(entity);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
