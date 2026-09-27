package com.renteasy.backend.controllers;

import com.renteasy.backend.models.Message;
import com.renteasy.backend.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService service;

    @GetMapping
    public List<Message> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getById(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Message create(@RequestBody Message entity) {
        return service.save(entity);
    }
    
    // TODO: Add other endpoints translated from messageController.js
}
