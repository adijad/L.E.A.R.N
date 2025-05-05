package com.ai.tutor.backend.controller;

import com.ai.tutor.backend.UserService.UserTopicProgressService;
import com.ai.tutor.backend.dto.LessonProgressDTO;
import com.ai.tutor.backend.dto.LoginRequest;
import com.ai.tutor.backend.dto.UserTopicProgressRequest;
import com.ai.tutor.backend.entity.UserTopicProgress;
import com.ai.tutor.backend.entity.Users;
import com.ai.tutor.backend.entity.UserLessonProgress;
import com.ai.tutor.backend.UserService.UserService;
import com.ai.tutor.backend.UserService.OTPService;
import com.ai.tutor.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private OTPService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserTopicProgressService progressService;


    // 📝 User registration
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Users user) {
        boolean userCreated = userService.registerUser(user);
        if (userCreated) {
            String otp = otpService.generateOTP();
            otpService.sendOTPEmail(user.getEmail(), otp);
            userService.saveOtpForUser(user.getEmail(), otp);
            return new ResponseEntity<>("User registered successfully. OTP sent to email.", HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("User already exists", HttpStatus.BAD_REQUEST);
        }
    }

    // 🔐 User login
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody LoginRequest loginRequest) {
        boolean isAuthenticated = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
        if (isAuthenticated) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    // 🔒 OTP Verification
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean isOtpValid = userService.verifyOtp(email, otp);
        if (isOtpValid) {
            return ResponseEntity.ok("OTP verified successfully. You can now log in.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP.");
        }
    }

    // ✅ Save user lesson progress
    @PostMapping("/progress/save")
    public ResponseEntity<String> saveLessonProgress(@RequestBody LessonProgressDTO dto) {
        Optional<Users> userOpt = userRepository.findByEmail(dto.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        userService.updateLessonProgress(
                userOpt.get(),
                dto.getTopic(),
                dto.getLessonName(),
                dto.getTocIndex(),
                dto.isCompleted(),
                dto.getLessonJson()
        );
        return ResponseEntity.ok("Lesson progress saved");
    }

    // 📈 Get progress for a topic
    @GetMapping("/progress/{userId}/completed")
    public List<UserLessonProgress> getCompletedLessons(@PathVariable Long userId, @RequestParam String topic) {
        Users user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return userService.getCompletedLessons(user, topic);
    }

    @GetMapping("/progress/{userId}/in-progress")
    public List<UserLessonProgress> getInProgressLessons(@PathVariable Long userId, @RequestParam String topic) {
        Users user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return userService.getInProgressLessons(user, topic);
    }

    @PostMapping("/progress/saveTOC")
    public ResponseEntity<String> saveUserTOC(@RequestBody UserTopicProgressRequest request) {
        progressService.saveUserTOC(
                request.getEmail(),
                request.getTopic(),
                request.getToc(),
                request.getTrivia(),
                request.getImageUrls()
        );return ResponseEntity.ok("TOC saved for user.");
    }


    @GetMapping("/progress/getTOC")
    public ResponseEntity<?> getTOC(@RequestParam String email, @RequestParam String topic) {
        try {
            Map<String, Object> response = progressService.getTableOfContentsWithMedia(email, topic);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/progress/summary")
    public ResponseEntity<List<Map<String, Object>>> getSummary(@RequestParam String email) {
        return ResponseEntity.ok(userService.getTopicCompletionSummary(email));
    }

    // ProgressController.java

    @GetMapping("/progress/completedLessons")
    public ResponseEntity<?> getCompletedLessons(@RequestParam String email, @RequestParam String topic) {
        Users user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        List<String> completedLessons = progressService.getCompletedLessonsForUserAndTopic(user, topic);
        return ResponseEntity.ok(completedLessons);
    }

    @DeleteMapping("/progress/deleteCourse")
    public ResponseEntity<?> deleteCourse(
            @RequestParam String email,
            @RequestParam String topic) {
        try {
            progressService.deleteUserCourseData(email, topic);
            return ResponseEntity.ok(Map.of("message", "Course '" + topic + "' removed successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete course: " + e.getMessage()));
        }
    }

}
