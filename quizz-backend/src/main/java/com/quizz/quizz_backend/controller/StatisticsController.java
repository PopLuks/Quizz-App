package com.quizz.quizz_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizz.quizz_backend.dto.StatisticsDTO;
import com.quizz.quizz_backend.service.StatisticsService;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatisticsDTO> getStatistics() {
        System.out.println("📊 Get statistics request received");
        StatisticsDTO statistics = statisticsService.getStatistics();
        return ResponseEntity.ok(statistics);
    }
}
