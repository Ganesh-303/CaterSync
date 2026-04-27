package com.catering.catersync.controller;

import com.catering.catersync.entity.CatererProfile;
import com.catering.catersync.service.CatererService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caterers")
public class CatererController {
    private final CatererService service;


    public CatererController(CatererService service) {
        this.service = service;
    }

    @PostMapping
    public CatererProfile register(@RequestBody CatererProfile c) {
        return service.register(c);
    }

    @GetMapping
    public List<CatererProfile> List() {
        return service.getAll();
    }
}
