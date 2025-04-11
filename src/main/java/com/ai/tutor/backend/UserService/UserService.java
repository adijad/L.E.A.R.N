package com.ai.tutor.backend.UserService;

import com.ai.tutor.backend.entity.UserTopicProgress;
import com.ai.tutor.backend.entity.Users;
import com.ai.tutor.backend.entity.UserLessonProgress;
import com.ai.tutor.backend.repository.UserLessonProgressRepository;
import com.ai.tutor.backend.repository.UserRepository;
import com.ai.tutor.backend.repository.UserTopicProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLessonProgressRepository userLessonProgressRepository;

    @Autowired
    private UserTopicProgressRepository userTopicProgressRepository;


    @Autowired
    private OTPService otpService;

    public boolean registerUser(Users user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return false;
        }
        userRepository.save(user);
        return true;
    }

    public boolean authenticateUser(String email, String password) {
        Optional<Users> userOptional = userRepository.findByEmail(email);
        return userOptional.isPresent() && userOptional.get().getPassword().equals(password);
    }

    public void saveOtpForUser(String email, String otp) {
        Optional<Users> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            user.setOtp(otp);
            user.setOtpExpiration(System.currentTimeMillis() + 300000);
            userRepository.save(user);
        }
    }

    public Users findById(Long id) {
        Optional<Users> optionalUser = userRepository.findById(id);
        return optionalUser.orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public List<Map<String, Object>> getTopicCompletionSummary(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<UserTopicProgress> topics = userTopicProgressRepository.findByUser(user);

        List<Map<String, Object>> result = new ArrayList<>();

        for (UserTopicProgress topicProgress : topics) {
            String topic = topicProgress.getTopic();
            List<String> allLessons = topicProgress.getToc();

            // Fetch user's completed lessons for this topic
            List<UserLessonProgress> completedLessons = userLessonProgressRepository
                    .findByUserAndTopicAndCompletedTrue(user, topic);

            int total = allLessons.size();
            int completed = completedLessons.size();

            double percent = total == 0 ? 0 : ((double) completed / total) * 100;

            Map<String, Object> entry = new HashMap<>();
            entry.put("topic", topic);
            entry.put("totalLessons", total);
            entry.put("completedLessons", completed);
            entry.put("completionPercentage", Math.round(percent));

            result.add(entry);
        }

        return result;
    }


    public Users findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<Users> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            if (user.getOtp().equals(otp) && user.getOtpExpiration() > System.currentTimeMillis()) {
                user.setVerified(true);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    // 🔄 Save or update lesson progress
    public void updateLessonProgress(Users user, String topic, String lessonName, int tocIndex, boolean isCompleted, String lessonJson) {
        System.out.println("=== updateLessonProgress CALLED ===");
        System.out.println("User: " + (user != null ? user.getEmail() : "null"));
        System.out.println("Topic: " + topic);
        System.out.println("Lesson: " + lessonName);
        System.out.println("TOC Index: " + tocIndex);
        System.out.println("Completed: " + isCompleted);

        Optional<UserLessonProgress> optionalProgress = userLessonProgressRepository
                .findByUserAndTopicAndLessonName(user, topic, lessonName);

        if (optionalProgress.isPresent()) {
            System.out.println("Progress already exists, updating it.");
        } else {
            System.out.println("Creating new progress record.");
        }

        UserLessonProgress progress = optionalProgress.orElse(new UserLessonProgress());

        progress.setUser(user);
        progress.setTopic(topic);
        progress.setLessonName(lessonName);
        progress.setTocIndex(tocIndex);
        progress.setLessonJson(lessonJson);
        progress.setInProgress(!isCompleted);
        progress.setCompleted(isCompleted);

        userLessonProgressRepository.save(progress);

        System.out.println("Progress saved successfully.");
    }


    public List<UserLessonProgress> getCompletedLessons(Users user, String topic) {
        return userLessonProgressRepository.findByUserAndTopicAndCompletedTrue(user, topic);
    }

    public List<UserLessonProgress> getInProgressLessons(Users user, String topic) {
        return userLessonProgressRepository.findByUserAndTopicAndInProgressTrue(user, topic);
    }


}
