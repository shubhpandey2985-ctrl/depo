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

        user foundUser =
                userRepository
                        .findByEmail(request.email())
                        .orElse(null);

        if (foundUser == null
                || !passwordEncoder.matches(
                        request.password(),
                        foundUser.getPassword())) {

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