package com.renteasy.backend.controllers;

import com.renteasy.backend.models.Cart;
import com.renteasy.backend.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    private CartService service;

    @GetMapping
    public List<Cart> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cart> getById(@PathVariable String id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Cart create(@RequestBody Cart entity) {
        return service.save(entity);
    }
    
    // TODO: Add other endpoints translated from cartController.js
}
