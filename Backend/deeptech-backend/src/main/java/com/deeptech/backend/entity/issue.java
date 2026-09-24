package com.deeptech.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
public class issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Resource being issued.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    @JsonIgnore
    private resource resource;

    // User receiving the resource.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private user user;

    // Date and time when the resource was issued.
    @Column(nullable = false)
    private LocalDateTime issuedAt;

    // Whether the resource needs to be returned.
    @Column(nullable = false)
    private boolean returnable;

    // Expected return date.
    private LocalDate returnDate;

    // Actual return date and time.
    private LocalDateTime returnedAt;

    // Issued / Returned / Overdue.
    @Column(nullable = false)
    private String status;

    // Number of units issued.
    @Column(nullable = false)
    private Integer quantity;

    public issue() {
    }

    public Long getId() {
        return id;
    }

    public resource getResource() {
        return resource;
    }

    public void setResource(resource resource) {
        this.resource = resource;
    }

    public user getUser() {
        return user;
    }

    public void setUser(user user) {
        this.user = user;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public boolean isReturnable() {
        return returnable;
    }

    public void setReturnable(boolean returnable) {
        this.returnable = returnable;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public LocalDateTime getReturnedAt() {
        return returnedAt;
    }

    public void setReturnedAt(LocalDateTime returnedAt) {
        this.returnedAt = returnedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    // These getters keep the API response compatible with the frontend.

    public Long getResourceId() {
        return resource != null ? resource.getId() : null;
    }

    public String getResourceName() {
        return resource != null ? resource.getName() : null;
    }

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    public String getUserName() {
        return user != null ? user.getName() : null;
    }

    public String getProfession() {
        return user != null ? user.getProfession() : null;
    }
}