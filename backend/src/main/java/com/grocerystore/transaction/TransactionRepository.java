package com.grocerystore.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    Optional<Transaction> findByClientId(String clientId);
    boolean existsByClientId(String clientId);

    @Query(value = "SELECT COALESCE(SUM(t.total_amount), 0), COUNT(t.id) FROM transactions t " +
                   "WHERE t.store_id = :storeId AND t.type IN ('CASH','DEBT') " +
                   "AND t.created_at::date = :date",
           nativeQuery = true)
    List<Object[]> aggregateDailyRevenue(@Param("storeId") UUID storeId,
                                        @Param("date") LocalDate date);

    @Query(value = "SELECT ti.product_id, p.name, SUM(ti.quantity) AS units_sold, SUM(ti.total_price) AS revenue " +
                   "FROM transaction_items ti " +
                   "JOIN transactions t ON ti.transaction_id = t.id " +
                   "JOIN products p ON p.id = ti.product_id " +
                   "WHERE t.store_id = :storeId AND t.type IN ('CASH','DEBT') AND t.created_at >= :start AND t.created_at < :end " +
                   "GROUP BY ti.product_id, p.name ORDER BY units_sold DESC LIMIT 20",
           nativeQuery = true)
    List<Object[]> aggregateTopProductsRaw(@Param("storeId") UUID storeId,
                                            @Param("start") java.sql.Timestamp start,
                                            @Param("end") java.sql.Timestamp end);
}
