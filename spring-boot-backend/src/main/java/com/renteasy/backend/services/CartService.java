package com.renteasy.backend.services;

import com.renteasy.backend.models.Cart;
import com.renteasy.backend.repositories.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository repository;

    public List<Cart> findAll() {
        return repository.findAll();
    }

    public Optional<Cart> findById(String id) {
        return repository.findById(id);
    }

    public Cart save(Cart entity) {
        return repository.save(entity);
    }

    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
