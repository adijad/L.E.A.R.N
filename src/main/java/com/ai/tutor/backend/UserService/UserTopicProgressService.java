package com.ai.tutor.backend.UserService;

import com.ai.tutor.backend.entity.UserLessonProgress;
import com.ai.tutor.backend.entity.UserTopicProgress;
import com.ai.tutor.backend.entity.Users;
import com.ai.tutor.backend.repository.UserLessonProgressRepository;
import com.ai.tutor.backend.repository.UserRepository;
import com.ai.tutor.backend.repository.UserTopicProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    public void saveUserTOC(String email, String topic, List<String> toc,
                            List<String> trivia, List<String> imageUrls) {
        Users user = userService.findByEmail(email);

        UserTopicProgress progress = new UserTopicProgress();
        progress.setUser(user);
        progress.setTopic(topic);
        progress.setToc(toc);
        progress.setTrivia(trivia);
        progress.setImageUrls(imageUrls);
        progress.setCompleted(false);
        userTopicProgressRepository.save(progress);
    }



    public Optional<UserTopicProgress> getProgressByUserAndTopic(Users user, String topic) {
        return userTopicProgressRepository.findByUserAndTopic(user, topic);
    }

    public List<UserTopicProgress> getAllProgressByUser(Users user) {
        return userTopicProgressRepository.findByUser(user);
    }

    public Map<String, Object> getTableOfContentsWithMedia(String email, String topic) {
        Users user = userService.findByEmail(email);

        return userTopicProgressRepository.findByUserAndTopic(user, topic)
                .map(progress -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("table_of_contents", progress.getToc());
                    response.put("trivia", progress.getTrivia());
                    response.put("image_urls", progress.getImageUrls());
                    return response;
                })
                .orElseThrow(() -> new RuntimeException("Progress not found"));
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

    @Transactional
    public void deleteUserCourseData(String email, String topic) {
        Users user = userService.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found with email: " + email);
        }
        userLessonProgressRepository.deleteByUserAndTopic(user, topic);
        userTopicProgressRepository.deleteByUserAndTopic(user, topic);
    }
}

