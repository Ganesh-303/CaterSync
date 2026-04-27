package com.catering.catersync.repository;


import com.catering.catersync.entity.MenuItem;
import com.catering.catersync.repository.projection.CatererPriceView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long>{
    List<MenuItem> findByCatererId(Long catererId);

    List<MenuItem> findByCatererIdAndFlashTrue(Long catererId);

    List<MenuItem> findByCatererIdAndCategory(Long catererId, String category);

    @Query("select m.catererId as catererId ,avg(m.price) as avgPrice "+ "from MenuItem m group by m.catererId")
    List<CatererPriceView> avgPriceByCaterer();


}
