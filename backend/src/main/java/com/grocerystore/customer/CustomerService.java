package com.grocerystore.customer;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> search(UUID storeId, String name) {
        if (name != null && !name.isBlank()) {
            return customerRepository.findByStoreIdAndNameContainingIgnoreCase(storeId, name);
        }
        return customerRepository.findByStoreId(storeId);
    }

    public Customer create(UUID storeId, String name, String phone) {
        Customer c = new Customer();
        c.setStoreId(storeId);
        c.setName(name);
        c.setPhone(phone);
        return customerRepository.save(c);
    }

    public Customer findById(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
    }
}
