package com.deeptech.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "categories",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_category_name_parent",
            columnNames = {"name", "parent_id"}
        )
    }
)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Null means this is a top-level category.
    // Example: Hardware, Software
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    public Category() {
    }

    public Category(String name) {
        this.name = name;
    }

    public Category(String name, Category parent) {
        this.name = name;
        this.parent = parent;
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

    public Category getParent() {
        return parent;
    }

    public void setParent(Category parent) {
        this.parent = parent;
    }
}