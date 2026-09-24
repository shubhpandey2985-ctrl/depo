package com.deeptech.backend.controller;

import com.deeptech.backend.entity.user;
import com.deeptech.backend.repository.userRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class passwordController {

    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public passwordController(
            userRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/change-password")
    public user changePassword(
            @RequestBody ChangePasswordRequest request) {

        user currentUser =
                userRepository
                        .findByEmail(request.email())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        // Verify the current/temporary password.
        if (!passwordEncoder.matches(
                request.currentPassword(),
                currentUser.getPassword())) {

            throw new RuntimeException(
                    "Current password is incorrect"
            );
        }

        // Basic password validation.
        if (request.newPassword() == null
                || request.newPassword().isBlank()) {

            throw new RuntimeException(
                    "New password cannot be empty"
            );
        }

        if (request.newPassword().length() < 6) {

            throw new RuntimeException(
                    "New password must contain at least 6 characters"
            );
        }

        // Store the new password as a BCrypt hash.
        currentUser.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        // User has successfully changed the temporary password.
        currentUser.setMustChangePassword(false);

        return userRepository.save(currentUser);
    }

    public record ChangePasswordRequest(
            String email,
            String currentPassword,
            String newPassword
    ) {}
}