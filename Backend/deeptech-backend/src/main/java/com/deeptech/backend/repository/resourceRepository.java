package com.deeptech.backend.repository;

import com.deeptech.backend.entity.resource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface resourceRepository extends JpaRepository<resource, Long> {
}