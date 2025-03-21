package com.ai.tutor.backend.UserService;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class OTPService {

    @Autowired
    private JavaMailSender emailSender;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION = 5 * 60 * 1000; // 5 minutes

    public String generateOTP() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10)); // Generates a digit from 0-9
        }
        return otp.toString();
    }

    public void sendOTPEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your OTP for Email Verification");
        message.setText("Your OTP for email verification is: " + otp);
        emailSender.send(message);
    }
}
