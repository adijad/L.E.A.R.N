package com.ai.tutor.backend.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "user_lesson_progress")
public class UserLessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    private String topic;
    private String lessonName;

    private boolean completed;
    private boolean inProgress;

    @Column(columnDefinition = "TEXT")
    private String lessonJson;

    private int tocIndex;

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

    public String getLessonName() {
        return lessonName;
    }

    public void setLessonName(String lessonName) {
        this.lessonName = lessonName;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public boolean isInProgress() {
        return inProgress;
    }

    public void setInProgress(boolean inProgress) {
        this.inProgress = inProgress;
    }

    public String getLessonJson() {
        return lessonJson;
    }

    public void setLessonJson(String lessonJson) {
        this.lessonJson = lessonJson;
    }

    public int getTocIndex() {
        return tocIndex;
    }

    public void setTocIndex(int tocIndex) {
        this.tocIndex = tocIndex;
    }
}