package com.grocerystore.transaction;

import com.grocerystore.auth.OverrideTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock TransactionRepository transactionRepository;
    @Mock OverrideTokenService overrideTokenService;
    @InjectMocks TransactionService transactionService;

    private final UUID storeId = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private CheckoutRequest cashRequest() {
        return new CheckoutRequest(
                "client-uuid-1", storeId, TransactionType.CASH, null, null,
                List.of(new CheckoutRequest.ItemDto(UUID.randomUUID(), 2, 15000L, false))
        );
    }

    @Test
    void checkout_newTransaction_savesAndReturns() {
        when(transactionRepository.findByClientId("client-uuid-1")).thenReturn(Optional.empty());
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Transaction result = transactionService.checkout(cashRequest());

        assertEquals(30000L, result.getTotalAmount());
        assertEquals(TransactionType.CASH, result.getType());
        verify(transactionRepository).save(any());
    }

    @Test
    void checkout_duplicateClientId_returnsExisting() {
        Transaction existing = new Transaction();
        existing.setClientId("client-uuid-1");
        when(transactionRepository.findByClientId("client-uuid-1")).thenReturn(Optional.of(existing));

        Transaction result = transactionService.checkout(cashRequest());

        assertSame(existing, result);
        verify(transactionRepository, never()).save(any());
    }
}
