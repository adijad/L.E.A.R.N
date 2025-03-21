package com.ai.tutor.backend.repository;

import com.ai.tutor.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {
    // Change this to return Optional<Users>
    Optional<Users> findByEmail(String email);

    boolean existsByEmail(String email);
}
