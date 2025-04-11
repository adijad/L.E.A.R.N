package com.ai.tutor.backend.repository;

import com.ai.tutor.backend.entity.UserTopicProgress;
import com.ai.tutor.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserTopicProgressRepository extends JpaRepository<UserTopicProgress, Long> {
    Optional<UserTopicProgress> findByUserAndTopic(Users user, String topic);
    List<UserTopicProgress> findByUser(Users user);



}