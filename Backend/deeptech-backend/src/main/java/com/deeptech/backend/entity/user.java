package com.deeptech.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_email",
                        columnNames = "email"
                )
        }
)
public class user {

    // Primary key. MySQL generates the ID automatically.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Full name displayed in the People section.
    @Column(nullable = false)
    private String name;

    // Email is unique because it is used for login.
    @Column(nullable = false, unique = true)
    private String email;

    /*
     * Password can be received from the frontend,
     * but it will NEVER be returned in JSON responses.
     *
     * The actual value stored in MySQL is a BCrypt hash.
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    // Matches the frontend Profession type.
    @Column(nullable = false)
    private String profession;

    // Admin or User.
    @Column(nullable = false)
    private String role;

    /*
     * True when the account was created with a temporary
     * password and the member must change it after login.
     */
    @Column(nullable = false)
    private boolean mustChangePassword = false;

    // Required by JPA/Hibernate.
    public user() {
    }

    public user(
            String name,
            String email,
            String password,
            String profession,
            String role) {

        this.name = name;
        this.email = email;
        this.password = password;
        this.profession = profession;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setMustChangePassword(
            boolean mustChangePassword) {

        this.mustChangePassword = mustChangePassword;
    }
}