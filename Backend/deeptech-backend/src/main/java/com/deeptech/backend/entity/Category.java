package com.deeptech.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    // Primary key of the category table.
    // MySQL will automatically generate this ID.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Name of the category, for example:
    // "Electronics", "Networking", "Lab Equipment"
    @Column(nullable = false, unique = true)
    private String name;

    // Empty constructor required by JPA/Hibernate.
    public Category() {
    }

    // Constructor useful when creating a new category in Java.
    public Category(String name) {
        this.name = name;
    }

    // Returns the category ID.
    public Long getId() {
        return id;
    }

    // Returns the category name.
    public String getName() {
        return name;
    }

    // Changes the category name.
    public void setName(String name) {
        this.name = name;
    }
}
