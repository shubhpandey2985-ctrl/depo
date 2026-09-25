package com.deeptech.backend.controller;

import com.deeptech.backend.entity.user;
import com.deeptech.backend.repository.userRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class authController {

    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public authController(
            userRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public user login(
            @RequestBody LoginRequest request) {

        if (request.email() == null
                || request.email().isBlank()) {

            throw new RuntimeException(
                    "Email cannot be empty"
            );
        }

        if (request.password() == null
                || request.password().isBlank()) {

            throw new RuntimeException(
                    "Password cannot be empty"
            );
        }

        String cleanEmail = request.email().trim();
        user foundUser =
                userRepository
                        .findByEmail(cleanEmail)
                        .orElse(null);

        if (foundUser == null) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        boolean matches = false;
        try {
            matches = passwordEncoder.matches(
                    request.password(),
                    foundUser.getPassword()
            );
        } catch (Exception ignored) {
            // Stored password might not be in valid BCrypt format.
        }

        // If stored as plaintext, verify and upgrade to BCrypt immediately
        if (!matches && request.password().equals(foundUser.getPassword())) {
            foundUser.setPassword(passwordEncoder.encode(request.password()));
            userRepository.save(foundUser);
            matches = true;
        }

        if (!matches) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        return foundUser;
    }

    public record LoginRequest(
            String email,
            String password
    ) {
    }
}