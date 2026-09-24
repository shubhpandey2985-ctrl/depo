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

        /*
         * Frontend runs on localhost:5173
         * Backend runs on localhost:8080
         */
        http.cors(cors -> cors.configurationSource(request -> {

            CorsConfiguration config =
                    new CorsConfiguration();

            config.setAllowedOrigins(
                    List.of("http://localhost:5173")
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

                /*
                 * Authentication endpoints
                 */
                .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login"
                ).permitAll()

                /*
                 * User management
                 * Only Admin can create/update/delete users.
                 */
                .requestMatchers("/api/users/**")
                .hasRole("Admin")

                /*
                 * Resources
                 * Only Admin can modify inventory.
                 */
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

                /*
                 * Issues
                 * Only Admin can issue/return/delete resources.
                 */
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

                /*
                 * Audit logs are Admin-only.
                 */
                .requestMatchers("/api/audit-logs/**")
                .hasRole("Admin")

                /*
                 * Everything else requires authentication.
                 */
                .anyRequest().authenticated()
        );

        /*
         * Current development authentication method.
         * We can replace this with JWT/session authentication later.
         */
        http.httpBasic(httpBasic -> {});

        return http.build();
    }
}