package com.renteasy.backend.controllers;

import com.renteasy.backend.models.Rental;
import com.renteasy.backend.services.RentalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    @Autowired
    private RentalService service;

    @GetMapping
    public List<Rental> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rental> getById(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Rental create(@RequestBody Rental entity) {
        return service.save(entity);
    }
    
    // TODO: Add other endpoints translated from rentalController.js
}
