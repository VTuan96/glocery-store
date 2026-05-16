package com.grocerystore.debt;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DebtService {

    private final DebtRepository debtRepository;

    public DebtService(DebtRepository debtRepository) {
        this.debtRepository = debtRepository;
    }

    @Transactional
    public DebtRecord record(UUID storeId, UUID customerId, DebtRecordType type, long amount, String note) {
        DebtRecord dr = new DebtRecord();
        dr.setStoreId(storeId);
        dr.setCustomerId(customerId);
        dr.setType(type);
        dr.setAmount(amount);
        dr.setNote(note);
        return debtRepository.save(dr);
    }

    public long getBalance(UUID customerId) {
        Long balance = debtRepository.findBalanceByCustomerId(customerId);
        return balance != null ? balance : 0L;
    }

    public List<DebtRecord> getHistory(UUID customerId) {
        return debtRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Object[]> getAllBalances(UUID storeId) {
        return debtRepository.findBalancesByStoreId(storeId);
    }
}
