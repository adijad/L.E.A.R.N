package com.ai.tutor.backend.dto;
public class LessonProgressDTO {

    private String email;
    private String topic;
    private String lessonName;
    private int tocIndex;
    private boolean completed;
    private String lessonJson;

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

    public String getLessonName() {
        return lessonName;
    }

    public void setLessonName(String lessonName) {
        this.lessonName = lessonName;
    }

    public int getTocIndex() {
        return tocIndex;
    }

    public void setTocIndex(int tocIndex) {
        this.tocIndex = tocIndex;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getLessonJson() {
        return lessonJson;
    }

    public void setLessonJson(String lessonJson) {
        this.lessonJson = lessonJson;
    }
}
