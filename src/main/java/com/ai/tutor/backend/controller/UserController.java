package com.ai.tutor.backend.controller;

import com.ai.tutor.backend.dto.LoginRequest;
import com.ai.tutor.backend.entity.Users;
import com.ai.tutor.backend.UserService.UserService;
import com.ai.tutor.backend.UserService.OTPService;  // Import the OTP service for sending OTP
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private OTPService otpService;  // Autowired the OTP service for sending OTP

    // User Registration
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Users user) {
        // Check if user is already registered
        boolean userCreated = userService.registerUser(user);
        if (userCreated) {
            // Generate and send OTP after user registration
            String otp = otpService.generateOTP();
            otpService.sendOTPEmail(user.getEmail(), otp);

            // Save OTP in the database or in-memory for verification later (temporary storage)
            userService.saveOtpForUser(user.getEmail(), otp);

            return new ResponseEntity<>("User registered successfully. OTP sent to email.", HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("User already exists", HttpStatus.BAD_REQUEST);
        }
    }

    // User Login
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody LoginRequest loginRequest) {
        boolean isAuthenticated = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());

        if (isAuthenticated) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    // Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean isOtpValid = userService.verifyOtp(email, otp);
        if (isOtpValid) {
            return ResponseEntity.ok("OTP verified successfully. You can now log in.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP.");
        }
    }
}
