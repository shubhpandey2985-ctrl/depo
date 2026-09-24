package com.deeptech.backend.repository;

import com.deeptech.backend.entity.issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.List;
import java.util.Map;

public interface issueRepository extends JpaRepository<issue, Long> {

    List<issue> findByUserId(Long userId);

    List<issue> findByResourceId(Long resourceId);

    List<issue> findByStatus(String status);

    long countByStatus(String status);

    List<issue> findByIssuedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );
}
