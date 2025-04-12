package com.ai.tutor.backend.repository;


import com.ai.tutor.backend.entity.UserLessonProgress;
import com.ai.tutor.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    List<UserLessonProgress> findByUserAndTopicAndCompletedTrue(Users user, String topic);
    void deleteByUserAndTopic(Users user, String topicName);
    List<UserLessonProgress> findByUserAndTopicAndInProgressTrue(Users user, String topic);
    Optional<UserLessonProgress> findByUserAndTopicAndLessonName(Users user, String topic, String lessonName);
}
