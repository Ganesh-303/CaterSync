package com.catering.catersync.service;


import com.catering.catersync.dto.CatererSearchResponse;
import com.catering.catersync.entity.CatererProfile;
import com.catering.catersync.repository.CatererRepository;
import com.catering.catersync.repository.MenuItemRepository;
import com.catering.catersync.repository.projection.CatererPriceView;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CatererSearchService {

    private final CatererRepository catererRepo;
    private final MenuItemRepository menuRepo;

    public CatererSearchService(CatererRepository catererRepo, MenuItemRepository menuRepo) {
        this.catererRepo = catererRepo;
        this.menuRepo = menuRepo;
    }

    public List<CatererSearchResponse> search(
            String vegType,
            Double minRating,
            Double minPrice,
            Double maxPrice,
            Boolean available

    ){
        List<CatererProfile> caterers = catererRepo.findAll();

        Map<Long, Double> avgPriceMap = menuRepo.avgPriceByCaterer().stream()
                .collect(Collectors.toMap(CatererPriceView::getCatererId,
                        p-> p.getAvgPrice()==null?0.0 : p.getAvgPrice()));

        List<CatererSearchResponse> results = new ArrayList<>();
        for(CatererProfile c : caterers) {
            CatererSearchResponse r = new CatererSearchResponse();
            r.setCatererId(c.getUserId());

            r.setVegType(c.getVegType());
            r.setAvailable(c.isAvailable());

            r.setRating(0.0);

            r.setEstimatedPrice(avgPriceMap.getOrDefault(c.getUserId(),0.0));
            results.add(r);
        }
        return results.stream()
                .filter(r -> vegType == null || vegType.isBlank() || vegType.equalsIgnoreCase(r.getVegType()))
                .filter(r -> available == null || r.isAvailable() == available)
                .filter(r -> minPrice == null || r.getEstimatedPrice() >= minPrice)
                .filter(r -> minRating == null || r.getRating() >= minRating )
                .filter(r -> maxPrice == null || r.getEstimatedPrice() <= maxPrice)
                .toList();
    }
}