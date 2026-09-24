package com.deeptech.backend.repository;

import com.deeptech.backend.entity.user;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface userRepository extends JpaRepository<user, Long> {

    // Used to find a user during login.
    Optional<user> findByEmail(String email);

    // Used to check whether an email is already registered.
    boolean existsByEmail(String email);
}