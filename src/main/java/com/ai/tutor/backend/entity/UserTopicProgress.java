package com.ai.tutor.backend.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "user_topic_progress")
public class UserTopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    private String topic;

    @ElementCollection
    @CollectionTable(name = "user_topic_toc", joinColumns = @JoinColumn(name = "user_topic_progress_id"))
    @Column(name = "lesson")
    private List<String> toc;

    private boolean completed;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
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

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
