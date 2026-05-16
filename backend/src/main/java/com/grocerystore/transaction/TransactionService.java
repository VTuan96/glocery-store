package com.grocerystore.transaction;

import com.grocerystore.auth.InvalidOverrideTokenException;
import com.grocerystore.auth.OverrideTokenService;
import com.grocerystore.debt.DebtRecordType;
import com.grocerystore.debt.DebtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final OverrideTokenService overrideTokenService;
    private final DebtService debtService;

    public TransactionService(TransactionRepository transactionRepository,
                               OverrideTokenService overrideTokenService,
                               DebtService debtService) {
        this.transactionRepository = transactionRepository;
        this.overrideTokenService = overrideTokenService;
        this.debtService = debtService;
    }

    /**
     * Idempotent checkout — duplicate clientId returns existing transaction (no-op).
     */
    @Transactional
    public Transaction checkout(CheckoutRequest req) {
        return transactionRepository.findByClientId(req.clientId())
                .orElseGet(() -> createTransaction(req));
    }

    private Transaction createTransaction(CheckoutRequest req) {
        boolean hasOverride = req.items().stream().anyMatch(CheckoutRequest.ItemDto::priceOverridden);
        if (hasOverride && req.overrideToken() != null) {
            try {
                overrideTokenService.validateAndConsume(UUID.fromString(req.overrideToken()));
            } catch (Exception e) {
                throw new InvalidOverrideTokenException();
            }
        }

        Transaction tx = new Transaction();
        tx.setStoreId(req.storeId());
        tx.setClientId(req.clientId());
        tx.setType(req.type());
        tx.setCustomerId(req.customerId());

        long total = 0;
        for (var item : req.items()) {
            TransactionItem ti = new TransactionItem();
            ti.setStoreId(req.storeId());
            ti.setProductId(item.productId());
            ti.setQuantity(item.quantity());
            ti.setUnitPrice(item.unitPrice());
            long lineTotal = item.unitPrice() * item.quantity();
            ti.setTotalPrice(lineTotal);
            ti.setPriceOverridden(item.priceOverridden());
            ti.setTransaction(tx);
            tx.getItems().add(ti);
            total += lineTotal;
        }
        tx.setTotalAmount(total);
        transactionRepository.save(tx);

        // Create DebtRecord for DEBT-type sales
        if (req.type() == TransactionType.DEBT && req.customerId() != null) {
            debtService.record(req.storeId(), req.customerId(), DebtRecordType.DEBT, total, null);
        }

        return tx;
    }
}
