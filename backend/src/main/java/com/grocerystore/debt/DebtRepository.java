package com.grocerystore.debt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DebtRepository extends JpaRepository<DebtRecord, UUID> {
    List<DebtRecord> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    @Query("SELECT d.customerId, SUM(CASE WHEN d.type = 'DEBT' THEN d.amount WHEN d.type = 'PAYMENT' THEN -d.amount ELSE d.amount END) " +
           "FROM DebtRecord d WHERE d.storeId = :storeId GROUP BY d.customerId")
    List<Object[]> findBalancesByStoreId(UUID storeId);

    @Query("SELECT SUM(CASE WHEN d.type = 'DEBT' THEN d.amount WHEN d.type = 'PAYMENT' THEN -d.amount ELSE d.amount END) " +
           "FROM DebtRecord d WHERE d.customerId = :customerId")
    Long findBalanceByCustomerId(UUID customerId);
}
