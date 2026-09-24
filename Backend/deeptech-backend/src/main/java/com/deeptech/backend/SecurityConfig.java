package com.deeptech.backend;

import com.deeptech.backend.repository.userRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            userRepository userRepository) {

        return username ->
                userRepository.findByEmail(username)
                        .map(dbUser ->
                                User.withUsername(dbUser.getEmail())
                                        .password(dbUser.getPassword())
                                        .roles(dbUser.getRole())
                                        .build()
                        )
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "User not found"
                                )
                        );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable());

        http.cors(cors -> cors.configurationSource(request -> {

            CorsConfiguration config =
                    new CorsConfiguration();

            String frontendUrl =
                    System.getenv().getOrDefault(
                            "FRONTEND_URL",
                            "http://localhost:5173"
                    );

            config.setAllowedOrigins(
                    List.of(frontendUrl)
            );

            config.setAllowedMethods(
                    List.of(
                            "GET",
                            "POST",
                            "PUT",
                            "DELETE",
                            "OPTIONS"
                    )
            );

            config.setAllowedHeaders(
                    List.of("*")
            );

            config.setAllowCredentials(true);

            return config;
        }));

        http.authorizeHttpRequests(auth -> auth

                .requestMatchers(
                        "/api/auth/login"
                ).permitAll()

                .requestMatchers(
                        "/api/users/**"
                ).hasRole("Admin")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/resources"
                ).hasRole("Admin")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/resources/**"
                ).hasRole("Admin")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/resources/**"
                ).hasRole("Admin")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/issues"
                ).hasRole("Admin")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/issues/**"
                ).hasRole("Admin")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/issues/**"
                ).hasRole("Admin")

                .requestMatchers(
                        "/api/audit-logs/**"
                ).hasRole("Admin")

                .anyRequest().authenticated()
        );

        http.httpBasic(httpBasic -> {});

        return http.build();
    }
}