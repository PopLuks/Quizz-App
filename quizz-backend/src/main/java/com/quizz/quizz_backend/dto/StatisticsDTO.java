package com.quizz.quizz_backend.dto;

import java.util.List;

public class StatisticsDTO {
    private Long totalQuizzes;
    private Long totalQuestions;
    private Long totalUsers;
    private Long totalAttempts;
    private Long activeUsers;
    private List<RecentActivityDTO> recentActivity;

    public StatisticsDTO() {
    }

    public StatisticsDTO(Long totalQuizzes, Long totalQuestions, Long totalUsers, Long totalAttempts, Long activeUsers, List<RecentActivityDTO> recentActivity) {
        this.totalQuizzes = totalQuizzes;
        this.totalQuestions = totalQuestions;
        this.totalUsers = totalUsers;
        this.totalAttempts = totalAttempts;
        this.activeUsers = activeUsers;
        this.recentActivity = recentActivity;
    }

    // Getters and Setters
    public Long getTotalQuizzes() {
        return totalQuizzes;
    }

    public void setTotalQuizzes(Long totalQuizzes) {
        this.totalQuizzes = totalQuizzes;
    }

    public Long getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Long totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(Long totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public Long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public List<RecentActivityDTO> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<RecentActivityDTO> recentActivity) {
        this.recentActivity = recentActivity;
    }

    public static class RecentActivityDTO {
        private Long id;
        private String user;
        private String action;
        private String time;

        public RecentActivityDTO() {
        }

        public RecentActivityDTO(Long id, String user, String action, String time) {
            this.id = id;
            this.user = user;
            this.action = action;
            this.time = time;
        }

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUser() {
            return user;
        }

        public void setUser(String user) {
            this.user = user;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }
    }
}
