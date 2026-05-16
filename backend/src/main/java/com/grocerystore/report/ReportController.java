package com.grocerystore.report;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@PreAuthorize("hasRole('OWNER')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/daily")
    public ResponseEntity<ReportService.DailyRevenueResponse> dailyReport(
            @RequestParam UUID storeId,
            @RequestParam(required = false) String date) {
        LocalDate reportDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(reportService.getDailyRevenue(storeId, reportDate));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<ReportService.TopProductEntry>> topProducts(
            @RequestParam UUID storeId,
            @RequestParam(defaultValue = "daily") String period) {
        return ResponseEntity.ok(reportService.getTopProducts(storeId, period));
    }
}
