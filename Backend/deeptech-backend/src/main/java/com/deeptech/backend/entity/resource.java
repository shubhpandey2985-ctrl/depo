package com.deeptech.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resources")
public class resource {

    // Database primary key.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Resource name, for example "Arduino Uno".
    @Column(nullable = false)
    private String name;

    // Matches the frontend category values: Hardware / Software.
    @Column(nullable = false)
    private String category;

    // Sub-category or additional classification.
    private String sub;

    // Number of units available.
    @Column(nullable = false)
    private Integer quantity;

    // Available / Low stock / Issued / Unavailable.
    @Column(nullable = false)
    private String status;

    // Frontend visual tone identifier.
    private String tone;

    // Physical location of the resource.
    private String location;

    public resource() {
    }

    public resource(String name, String category, String sub,
                    Integer quantity, String status,
                    String tone, String location) {
        this.name = name;
        this.category = category;
        this.sub = sub;
        this.quantity = quantity;
        this.status = status;
        this.tone = tone;
        this.location = location;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSub() {
        return sub;
    }

    public void setSub(String sub) {
        this.sub = sub;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}