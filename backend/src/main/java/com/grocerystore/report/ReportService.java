package com.grocerystore.report;

import com.grocerystore.transaction.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;

    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public DailyRevenueResponse getDailyRevenue(UUID storeId, LocalDate date) {
        var start = date.atStartOfDay().toInstant(ZoneOffset.UTC);
        var end = date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Object[] row = transactionRepository.aggregateDailyRevenue(storeId, start, end);
        long totalRevenue = row[0] != null ? ((Number) row[0]).longValue() : 0L;
        int count = row[1] != null ? ((Number) row[1]).intValue() : 0;
        return new DailyRevenueResponse(date.toString(), totalRevenue, count);
    }

    public List<TopProductEntry> getTopProducts(UUID storeId, String period) {
        var end = LocalDate.now().plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        var start = "weekly".equals(period)
                ? LocalDate.now().minusDays(6).atStartOfDay().toInstant(ZoneOffset.UTC)
                : LocalDate.now().atStartOfDay().toInstant(ZoneOffset.UTC);
        return transactionRepository.aggregateTopProductsRaw(storeId, start, end).stream()
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
