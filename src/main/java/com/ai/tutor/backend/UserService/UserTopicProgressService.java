package com.ai.tutor.backend.UserService;

import com.ai.tutor.backend.entity.UserLessonProgress;
import com.ai.tutor.backend.entity.UserTopicProgress;
import com.ai.tutor.backend.entity.Users;
import com.ai.tutor.backend.repository.UserLessonProgressRepository;
import com.ai.tutor.backend.repository.UserRepository;
import com.ai.tutor.backend.repository.UserTopicProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserTopicProgressService {

    @Autowired
    private UserTopicProgressRepository userTopicProgressRepository;

    @Autowired
    private UserLessonProgressRepository userLessonProgressRepository;

    @Autowired
    private UserService userService;

    public void saveUserTOC(String email, String topic, List<String> toc) {
        Users user = userService.findByEmail(email);

        UserTopicProgress progress = new UserTopicProgress();
        progress.setUser(user);
        progress.setTopic(topic);
        progress.setToc(toc); // assuming this is a List<String> field in the entity
        progress.setCompleted(false); // initially not completed

        userTopicProgressRepository.save(progress);
    }



    public Optional<UserTopicProgress> getProgressByUserAndTopic(Users user, String topic) {
        return userTopicProgressRepository.findByUserAndTopic(user, topic);
    }

    public List<UserTopicProgress> getAllProgressByUser(Users user) {
        return userTopicProgressRepository.findByUser(user);
    }

    public List<String> getTableOfContents(String email, String topic) {
        // 1. Find the user based on the provided email.
        Users user = userService.findByEmail(email);

        if (user == null) {
            return null; // Or throw an exception indicating user not found
        }

        // 2. Find the UserTopicProgress entry for the given user and topic.
        Optional<UserTopicProgress> userTopicProgressOptional = userTopicProgressRepository.findByUserAndTopic(user, topic);

        // 3. Extract and return the TOC if found.
        return userTopicProgressOptional.map(UserTopicProgress::getToc).orElse(null);
    }

    public List<String> getCompletedLessonsForUserAndTopic(Users user, String topic) {
        return userLessonProgressRepository.findByUserAndTopicAndCompletedTrue(user, topic)
                .stream()
                .map(UserLessonProgress::getLessonName)
                .collect(Collectors.toList());
    }
}

