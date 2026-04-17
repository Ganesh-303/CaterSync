package com.catering.catersync.dto;

import java.util.List;

public class AssignStaffRequest {
    private List<Long> staffIds;
    private String duty;

    public List<Long> getStaffIds(){ return staffIds;}
    public void setStaffIds(List<Long> staffIds){this.staffIds = staffIds;}

    public String getDuty() {return duty;}
    public void setDuty(String duty){this.duty =duty;}
}
