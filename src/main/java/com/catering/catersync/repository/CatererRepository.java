package com.catering.catersync.repository;

import  com.catering.catersync.entity.CatererProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatererRepository extends JpaRepository<CatererProfile, Long>{
}