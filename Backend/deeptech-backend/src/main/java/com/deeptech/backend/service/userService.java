package com.deeptech.backend.service;

import com.deeptech.backend.entity.user;
import com.deeptech.backend.repository.userRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class userService {

    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final auditLogService auditLogService;

    public userService(
            userRepository userRepository,
            PasswordEncoder passwordEncoder,
            auditLogService auditLogService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public List<user> getAllUsers() {

        return userRepository.findAll();
    }

    public user getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        ));
    }

    public user createUser(user newUser) {

        if (newUser.getEmail() == null
                || newUser.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email cannot be empty"
            );
        }

        if (userRepository.existsByEmail(
                newUser.getEmail())) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }

        if (newUser.getPassword() == null
                || newUser.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password cannot be empty"
            );
        }

        if (newUser.getPassword().length() < 6) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters"
            );
        }

        newUser.setPassword(
                passwordEncoder.encode(
                        newUser.getPassword()
                )
        );

        newUser.setMustChangePassword(true);

        user savedUser =
                userRepository.save(newUser);

        auditLogService.log(
                "CREATE",
                "USER",
                savedUser.getId(),
                "Created user: "
                        + savedUser.getEmail()
        );

        return savedUser;
    }

    public user updateUser(
            Long id,
            user userDetails) {

        user existingUser =
                getUserById(id);

        if (userDetails.getName() == null
                || userDetails.getName().isBlank()) {

            throw new RuntimeException(
                    "Name cannot be empty"
            );
        }

        if (userDetails.getEmail() == null
                || userDetails.getEmail().isBlank()) {

            throw new RuntimeException(
                    "Email cannot be empty"
            );
        }

        if (!existingUser.getEmail()
                .equalsIgnoreCase(
                        userDetails.getEmail()
                )
                && userRepository.existsByEmail(
                        userDetails.getEmail()
                )) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }

        existingUser.setName(
                userDetails.getName()
        );

        existingUser.setEmail(
                userDetails.getEmail()
        );

        existingUser.setProfession(
                userDetails.getProfession()
        );

        existingUser.setRole(
                userDetails.getRole()
        );

        boolean passwordReset = false;

        if (userDetails.getPassword() != null
                && !userDetails.getPassword().isBlank()) {

            if (userDetails.getPassword().length() < 6) {

                throw new RuntimeException(
                        "Password must contain at least 6 characters"
                );
            }

            existingUser.setPassword(
                    passwordEncoder.encode(
                            userDetails.getPassword()
                    )
            );

            existingUser.setMustChangePassword(true);

            passwordReset = true;
        }

        user savedUser =
                userRepository.save(existingUser);

        auditLogService.log(
                "UPDATE",
                "USER",
                savedUser.getId(),
                "Updated user: "
                        + savedUser.getEmail()
        );

        if (passwordReset) {

            auditLogService.log(
                    "PASSWORD_RESET",
                    "USER",
                    savedUser.getId(),
                    "Reset temporary password for user: "
                            + savedUser.getEmail()
            );
        }

        return savedUser;
    }

    public void deleteUser(Long id) {

        user existingUser =
                getUserById(id);

        String email =
                existingUser.getEmail();

        userRepository.delete(existingUser);

        auditLogService.log(
                "DELETE",
                "USER",
                id,
                "Deleted user: " + email
        );
    }
}