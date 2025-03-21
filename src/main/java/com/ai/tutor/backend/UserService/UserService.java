package com.ai.tutor.backend.UserService;

import com.ai.tutor.backend.entity.Users;
import com.ai.tutor.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OTPService otpService;

    // Register user manually
    public boolean registerUser(Users user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return false; // User already exists
        }
        userRepository.save(user);
        return true;
    }

    public boolean authenticateUser(String email, String password) {
        Optional<Users> userOptional = userRepository.findByEmail(email);
        return userOptional.isPresent() && userOptional.get().getPassword().equals(password);
    }


    // Save OTP for verification (could be saved temporarily in memory or database)
    public void saveOtpForUser(String email, String otp) {
        Optional<Users> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            user.setOtp(otp);  // Assuming you have an OTP field in the User entity
            user.setOtpExpiration(System.currentTimeMillis() + 300000);  // OTP expires in 5 minutes
            userRepository.save(user);
        }
    }

    // Verify OTP
    public boolean verifyOtp(String email, String otp) {
        Optional<Users> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            if (user.getOtp().equals(otp) && user.getOtpExpiration() > System.currentTimeMillis()) {
                user.setVerified(true);
                userRepository.save(user);
                return true;  // OTP is valid and user is marked as verified
            }
        }
        return false;  // Invalid OTP or expired OTP
    }
}
