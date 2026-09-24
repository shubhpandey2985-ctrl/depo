package com.deeptech.backend.controller;

import com.deeptech.backend.entity.auditLog;
import com.deeptech.backend.service.auditLogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class auditLogController {

    private final auditLogService auditLogService;

    public auditLogController(auditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<auditLog> getAllLogs() {
        return auditLogService.getAllLogs();
    }
}