package com.deeptech.backend;

import com.deeptech.backend.entity.user;
import com.deeptech.backend.repository.userRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DeeptechBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeeptechBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedDemoAccounts(
			userRepository userRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			if (!userRepository.existsByEmail("admin@deeptech.com")) {
				user admin = new user();
				admin.setName("Admin");
				admin.setEmail("admin@deeptech.com");
				admin.setPassword(passwordEncoder.encode("123456"));
				admin.setProfession("Staff");
				admin.setRole("Admin");
				admin.setMustChangePassword(false);
				userRepository.save(admin);
			}

			if (!userRepository.existsByEmail("user@deeptech.com")) {
				user demoUser = new user();
				demoUser.setName("Demo User");
				demoUser.setEmail("user@deeptech.com");
				demoUser.setPassword(passwordEncoder.encode("123456"));
				demoUser.setProfession("Student");
				demoUser.setRole("User");
				demoUser.setMustChangePassword(false);
				userRepository.save(demoUser);
			}
		};
	}
}

