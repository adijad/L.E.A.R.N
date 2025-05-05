package com.ai.tutor.backend.dto;


import java.util.List;

public class UserTopicProgressRequest {
    private String email;
    private String topic;
    private List<String> toc;
    private List<String> trivia;
    private List<String> imageUrls;


    // Constructors
    public UserTopicProgressRequest() {}

    public UserTopicProgressRequest(String email, String topic, List<String> toc,
                                    List<String> trivia, List<String> imageUrls) {
        this.email = email;
        this.topic = topic;
        this.toc = toc;
        this.trivia = trivia;
        this.imageUrls = imageUrls;
    }

    // Add getters and setters
    public List<String> getTrivia() {
        return trivia;
    }

    public void setTrivia(List<String> trivia) {
        this.trivia = trivia;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public List<String> getToc() {
        return toc;
    }

    public void setToc(List<String> toc) {
        this.toc = toc;
    }
}
