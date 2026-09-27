package com.renteasy.backend.controllers;

import com.renteasy.backend.models.UserInteraction;
import com.renteasy.backend.services.UserInteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/userInteractions")
public class UserInteractionController {

    @Autowired
    private UserInteractionService service;

    @GetMapping
    public List<UserInteraction> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserInteraction> getById(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserInteraction create(@RequestBody UserInteraction entity) {
        return service.save(entity);
    }
    
    // TODO: Add other endpoints translated from userInteractionController.js
}
