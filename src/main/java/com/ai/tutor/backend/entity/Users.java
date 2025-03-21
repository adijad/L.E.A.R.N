package com.ai.tutor.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users", schema = "public")  // Specify schema if required
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String otp = "";  // Default empty string

    @Column(nullable = false)
    private long otpExpiration = 0L;  // Default 0 to avoid null issues

    @Column(nullable = false)
    private boolean verified = false;  // Default false

    // Default Constructor
    public Users() {
        this.otp = "";
        this.otpExpiration = 0L;
        this.verified = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public long getOtpExpiration() {
        return otpExpiration;
    }

    public void setOtpExpiration(long otpExpiration) {
        this.otpExpiration = otpExpiration;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }
}
