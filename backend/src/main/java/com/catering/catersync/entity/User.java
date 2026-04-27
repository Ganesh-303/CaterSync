package com.catering.catersync.entity;

import jakarta.persistence.*;

@Entity
@Table(name ="users" )
public class User {
    @Id
    private Long id;

    private String name;
    private String email;
    private String password;
    private String role;
    private Double rating;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}
