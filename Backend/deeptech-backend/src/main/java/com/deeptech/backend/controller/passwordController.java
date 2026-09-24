package com.deeptech.backend.controller;

import com.deeptech.backend.entity.user;
import com.deeptech.backend.repository.userRepository;
import com.deeptech.backend.service.auditLogService;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class passwordController {

    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final auditLogService auditLogService;

    public passwordController(
            userRepository userRepository,
            PasswordEncoder passwordEncoder,
            auditLogService auditLogService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/change-password")
    public user changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication is required"
            );
        }

        String loggedInEmail =
                authentication.getName();

        user currentUser =
                userRepository
                        .findByEmail(loggedInEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

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

        if (passwordEncoder.matches(
                request.newPassword(),
                currentUser.getPassword())) {

            throw new RuntimeException(
                    "New password must be different from the current password"
            );
        }

        currentUser.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        currentUser.setMustChangePassword(false);

        user savedUser =
                userRepository.save(currentUser);

        auditLogService.log(
                "PASSWORD_CHANGE",
                "USER",
                savedUser.getId(),
                "Password changed for user: "
                        + savedUser.getEmail()
        );

        return savedUser;
    }

    public record ChangePasswordRequest(
            String newPassword
    ) {
    }
}