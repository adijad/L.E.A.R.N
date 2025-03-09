package com.ai.tutor.backend.UserService;

import com.ai.tutor.backend.entity.Users;
import com.ai.tutor.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Register user manually
    public boolean registerUser(Users user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return false; // User already exists
        }
        userRepository.save(user);
        return true;
    }

    public boolean authenticateUser(String username, String password) {
        // Find the user by username
        Users user = userRepository.findByEmail(username);

        if (user != null && user.getPassword().equals(password)) {
            return true;  // Login success
        } else {
            return false;  // Invalid username or password
        }
    }
}