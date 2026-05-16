package com.grocerystore.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StoreUserRepository extends JpaRepository<StoreUser, UUID> {

    Optional<StoreUser> findByStoreIdAndRoleAndActiveTrue(UUID storeId, UserRole role);

    List<StoreUser> findAllByStoreId(UUID storeId);

    List<StoreUser> findByStoreIdAndRole(UUID storeId, UserRole role);
}
