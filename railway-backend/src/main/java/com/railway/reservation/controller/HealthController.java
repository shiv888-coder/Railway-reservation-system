package com.railway.reservation.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringBootVersion;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health Check REST Controller
 *
 * Provides a lightweight status verification endpoint to confirm
 * that the Spring Boot backend server is active and reachable.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${app.project.title:Railway Reservation System}")
    private String projectTitle;

    @Value("${app.project.version:1.0.0}")
    private String projectVersion;

    @Value("${app.project.student.name:Shiv Shankar Mal}")
    private String studentName;

    @Value("${app.project.student.group:9}")
    private String studentGroup;

    @Value("${app.project.student.roll:2760012408}")
    private String studentRoll;

    /**
     * Health check endpoint: GET /api/health
     *
     * @return JSON payload containing server status and project metadata
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("message", "Railway Reservation System Spring Boot Backend is operational.");
        response.put("timestamp", Instant.now().toString());

        // Academic Project Metadata
        Map<String, String> projectInfo = new LinkedHashMap<>();
        projectInfo.put("title", projectTitle);
        projectInfo.put("version", projectVersion);
        projectInfo.put("student", studentName);
        projectInfo.put("group", studentGroup);
        projectInfo.put("rollNumber", studentRoll);
        projectInfo.put("course", "B.Tech CSE - Java & OOP Lab Mini Project");
        response.put("project", projectInfo);

        // Runtime Environment Details
        Map<String, String> runtime = new LinkedHashMap<>();
        runtime.put("javaVersion", System.getProperty("java.version"));
        runtime.put("javaVendor", System.getProperty("java.vendor"));
        runtime.put("springBootVersion", SpringBootVersion.getVersion());
        runtime.put("os", System.getProperty("os.name"));
        response.put("runtime", runtime);

        return ResponseEntity.ok(response);
    }
}
