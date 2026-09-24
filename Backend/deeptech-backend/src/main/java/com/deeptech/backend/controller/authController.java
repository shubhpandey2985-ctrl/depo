package com.deeptech.backend.controller;

import com.deeptech.backend.entity.user;
import com.deeptech.backend.repository.userRepository;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public user register(
            @RequestBody RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        user newUser = new user();

        newUser.setName(request.name());
        newUser.setEmail(request.email());
        newUser.setPassword(
                passwordEncoder.encode(request.password())
        );
        newUser.setProfession(request.profession());

        // Public registration can only create normal users.
        newUser.setRole("User");

        // New accounts must change their password
        // after the first login.
        newUser.setMustChangePassword(true);

        return userRepository.save(newUser);
    }

    @PostMapping("/login")
    public user login(
            @RequestBody LoginRequest request) {

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

    public record RegisterRequest(
            String name,
            String email,
            String password,
            String profession,
            String role
    ) {}

    public record LoginRequest(
            String email,
            String password
    ) {}
}