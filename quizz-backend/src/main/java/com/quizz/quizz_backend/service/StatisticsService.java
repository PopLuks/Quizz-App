package com.quizz.quizz_backend.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quizz.quizz_backend.dto.StatisticsDTO;
import com.quizz.quizz_backend.repository.QuestionRepository;
import com.quizz.quizz_backend.repository.QuizAttemptRepository;
import com.quizz.quizz_backend.repository.QuizRepository;
import com.quizz.quizz_backend.repository.UserRepository;

@Service
public class StatisticsService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    public StatisticsDTO getStatistics() {
        System.out.println("📊 Fetching statistics...");

        Long totalQuizzes = quizRepository.count();
        Long totalQuestions = questionRepository.count();
        Long totalUsers = userRepository.count();
        Long totalAttempts = quizAttemptRepository.count();
        
        // Active users: users with attempts in the last 7 days
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        Long activeUsers = quizAttemptRepository.countDistinctUsersByCompletedAtAfter(sevenDaysAgo);

        // Get recent activity (last 10 attempts)
        List<StatisticsDTO.RecentActivityDTO> recentActivity = new ArrayList<>();
        var recentAttempts = quizAttemptRepository.findTop10ByOrderByCompletedAtDesc();
        
        System.out.println("Found " + recentAttempts.size() + " recent attempts");
        
        int count = 0;
        for (var attempt : recentAttempts) {
            if (count >= 10) break;
            
            try {
                String quizTitle = attempt.getQuiz().getTitle();
                String username = attempt.getUser().getUsername();
                Double score = attempt.getScore();
                LocalDateTime completedAt = attempt.getCompletedAt();
                
                String action = String.format("Completed quiz \"%s\" with score %.1f%%", quizTitle, score);
                String timeAgo = getTimeAgo(completedAt);
                
                recentActivity.add(new StatisticsDTO.RecentActivityDTO(
                    attempt.getId(),
                    username,
                    action,
                    timeAgo
                ));
                count++;
            } catch (Exception e) {
                System.err.println("Error processing attempt " + attempt.getId() + ": " + e.getMessage());
            }
        }

        System.out.println("✅ Statistics fetched: Quizzes=" + totalQuizzes + 
            ", Questions=" + totalQuestions + 
            ", Users=" + totalUsers +
            ", Active=" + activeUsers +
            ", Recent=" + recentActivity.size());

        return new StatisticsDTO(totalQuizzes, totalQuestions, totalUsers, totalAttempts, activeUsers, recentActivity);
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        
        long seconds = duration.getSeconds();
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;

        if (days > 0) {
            return days == 1 ? "1 day ago" : days + " days ago";
        } else if (hours > 0) {
            return hours == 1 ? "1 hour ago" : hours + " hours ago";
        } else if (minutes > 0) {
            return minutes == 1 ? "1 minute ago" : minutes + " minutes ago";
        } else {
            return "Just now";
        }
    }
}
