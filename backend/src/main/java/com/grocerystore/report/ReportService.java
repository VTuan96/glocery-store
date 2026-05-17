package com.grocerystore.report;

import com.grocerystore.transaction.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    private final TransactionRepository transactionRepository;

    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public DailyRevenueResponse getDailyRevenue(UUID storeId, LocalDate date) {
        log.info("DailyRevenue query storeId={} date={}", storeId, date);
        List<Object[]> rows = transactionRepository.aggregateDailyRevenue(storeId, date);
        Object[] row = (rows == null || rows.isEmpty()) ? null : rows.get(0);
        log.info("DailyRevenue row={}", (Object) rows);
        if (row == null || row.length < 2) {
            return new DailyRevenueResponse(date.toString(), 0L, 0);
        }
        long totalRevenue = 0L;
        int count = 0;
        try {
            if (row[0] != null && row[0] instanceof Number) {
                totalRevenue = ((Number) row[0]).longValue();
            }
            if (row[1] != null && row[1] instanceof Number) {
                count = ((Number) row[1]).intValue();
            }
        } catch (Exception e) {
            return new DailyRevenueResponse(date.toString(), 0L, 0);
        }
        return new DailyRevenueResponse(date.toString(), totalRevenue, count);
    }

    public List<TopProductEntry> getTopProducts(UUID storeId, String period) {
        LocalDateTime end = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime start = "weekly".equals(period)
            ? LocalDate.now().minusDays(6).atStartOfDay()
            : LocalDate.now().atStartOfDay();
        return transactionRepository.aggregateTopProductsRaw(storeId, Timestamp.valueOf(start), Timestamp.valueOf(end)).stream()
                .map(row -> new TopProductEntry(
                        UUID.fromString(row[0].toString()),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        ((Number) row[3]).longValue()))
                .toList();
    }

    public record DailyRevenueResponse(String date, long totalRevenue, int transactionCount) {}
    public record TopProductEntry(UUID productId, String productName, long unitsSold, long revenue) {}
}
