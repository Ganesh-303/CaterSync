package com.catering.catersync.controller;


import com.catering.catersync.dto.CatererSearchResponse;
import com.catering.catersync.service.CatererSearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/caterers")
public class CatererSearchController {
    private final CatererSearchService service;

    public CatererSearchController(CatererSearchService service) {
        this.service = service;
    }

    @GetMapping("/search")
    public List<CatererSearchResponse> search(
            @RequestParam(required = false) String vegType,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean available
    ){
        return service.search(vegType,minRating,minPrice,maxPrice,available);
    }
}
