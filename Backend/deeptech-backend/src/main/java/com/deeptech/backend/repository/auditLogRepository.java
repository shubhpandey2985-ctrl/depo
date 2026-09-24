package com.deeptech.backend.repository;

import com.deeptech.backend.entity.auditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface auditLogRepository extends JpaRepository<auditLog, Long> {

    List<auditLog> findAllByOrderByTimestampDesc();
}