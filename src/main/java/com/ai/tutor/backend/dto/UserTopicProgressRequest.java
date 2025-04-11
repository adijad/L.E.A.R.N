package com.ai.tutor.backend.dto;


import java.util.List;

public class UserTopicProgressRequest {
    private String email;
    private String topic;
    private List<String> toc;

    // Constructors
    public UserTopicProgressRequest() {}

    public UserTopicProgressRequest(String email, String topic, List<String> toc) {
        this.email = email;
        this.topic = topic;
        this.toc = toc;
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
