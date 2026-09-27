package com.renteasy.backend.controllers;

import com.renteasy.backend.models.Conversation;
import com.renteasy.backend.services.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService service;

    @GetMapping
    public List<Conversation> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getById(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Conversation create(@RequestBody Conversation entity) {
        return service.save(entity);
    }
    
    // TODO: Add other endpoints translated from conversationController.js
}
