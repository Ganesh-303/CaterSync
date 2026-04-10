package com.catering.catersync.service;


import com.catering.catersync.entity.CatererProfile;
import com.catering.catersync.repository.CatererRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatererService {
    private final CatererRepository repo;

    public CatererService(CatererRepository repo ) {
        this.repo = repo;
    }
    public CatererProfile register(CatererProfile c){
        return repo.save(c);
    }
    public List<CatererProfile> getAll() {
        return repo.findAll();
    }
    }
