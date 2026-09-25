package com.deeptech.backend.controller;

import com.deeptech.backend.entity.user;
import com.deeptech.backend.service.userService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class userController {

    private final userService userService;

    public userController(userService userService) {
        this.userService = userService;
    }

    /*
     * Get all users.
     * Admin only because /api/users/** is protected in SecurityConfig.
     */
    @GetMapping
    public List<user> getAllUsers() {
        return userService.getAllUsers();
    }

    /*
     * Get one user.
     */
    @GetMapping("/{id}")
    public user getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }

    /*
     * Create a new club member account.
     *
     * The normal People section should create
     * User accounts, not Admin accounts.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public user createUser(
            @RequestBody user newUser) {

        if (newUser.getRole() == null || newUser.getRole().isBlank()) {
            newUser.setRole("User");
        } else if (!"Admin".equalsIgnoreCase(newUser.getRole())) {
            newUser.setRole("User");
        } else {
            newUser.setRole("Admin");
        }

        return userService.createUser(newUser);
    }

    /*
     * Update an existing user.
     */
    @PutMapping("/{id}")
    public user updateUser(
            @PathVariable Long id,
            @RequestBody user userDetails) {

        return userService.updateUser(
                id,
                userDetails
        );
    }

    /*
     * Delete a user.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);
    }
}