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

    public userService(
            userRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        if (userRepository.existsByEmail(newUser.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Password is stored as a BCrypt hash.
        newUser.setPassword(
                passwordEncoder.encode(newUser.getPassword())
        );

        // Newly created accounts must change their
        // temporary password after first login.
        newUser.setMustChangePassword(true);

        return userRepository.save(newUser);
    }

    public user updateUser(
            Long id,
            user userDetails) {

        user existingUser = getUserById(id);

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

        if (userDetails.getPassword() != null
                && !userDetails.getPassword().isBlank()) {

            existingUser.setPassword(
                    passwordEncoder.encode(
                            userDetails.getPassword()
                    )
            );
        }

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {

        user user = getUserById(id);

        userRepository.delete(user);
    }
}