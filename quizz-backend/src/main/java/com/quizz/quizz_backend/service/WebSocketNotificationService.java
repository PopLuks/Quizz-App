package com.quizz.quizz_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notifyQuizUpdate(String action, Long quizId) {
        messagingTemplate.convertAndSend("/topic/quizzes", 
            new QuizNotification(action, quizId, System.currentTimeMillis()));
    }

    public void notifyQuizAttempt(Long quizId, String username) {
        messagingTemplate.convertAndSend("/topic/attempts", 
            new AttemptNotification(quizId, username, System.currentTimeMillis()));
    }

    // Notification DTOs
    public static class QuizNotification {
        private String action; // "created", "updated", "deleted"
        private Long quizId;
        private Long timestamp;

        public QuizNotification(String action, Long quizId, Long timestamp) {
            this.action = action;
            this.quizId = quizId;
            this.timestamp = timestamp;
        }

        public String getAction() { return action; }
        public Long getQuizId() { return quizId; }
        public Long getTimestamp() { return timestamp; }
    }

    public static class AttemptNotification {
        private Long quizId;
        private String username;
        private Long timestamp;

        public AttemptNotification(Long quizId, String username, Long timestamp) {
            this.quizId = quizId;
            this.username = username;
            this.timestamp = timestamp;
        }

        public Long getQuizId() { return quizId; }
        public String getUsername() { return username; }
        public Long getTimestamp() { return timestamp; }
    }
}
