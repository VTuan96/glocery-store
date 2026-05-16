package com.grocerystore.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    static final UUID DEFAULT_STORE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final StoreUserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataSeeder(StoreUserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findAllByStoreId(DEFAULT_STORE_ID).isEmpty()) {
            StoreUser owner = new StoreUser();
            owner.setStoreId(DEFAULT_STORE_ID);
            owner.setName("Owner");
            owner.setPinHash(passwordEncoder.encode("1234"));
            owner.setRole(UserRole.OWNER);
            owner.setActive(true);
            userRepository.save(owner);
            log.warn("⚠️ Default owner PIN is 1234 — change immediately in production!");
        }
    }
}
