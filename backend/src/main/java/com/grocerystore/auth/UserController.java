package com.grocerystore.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('OWNER')")
public class UserController {

    private final StoreUserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(StoreUserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<UserResponse> listStaff(@RequestParam UUID storeId) {
        return userRepository.findByStoreIdAndRole(storeId, UserRole.STAFF)
                .stream().map(UserResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<UserResponse> createStaff(@Valid @RequestBody UserRequest request) {
        StoreUser user = new StoreUser();
        user.setStoreId(request.storeId());
        user.setName(request.name());
        user.setPinHash(passwordEncoder.encode(request.pin()));
        user.setRole(UserRole.STAFF);
        user.setActive(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(userRepository.save(user)));
    }

    @PatchMapping("/{userId}/deactivate")
    public UserResponse deactivate(@PathVariable UUID userId) {
        StoreUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setActive(false);
        return UserResponse.from(userRepository.save(user));
    }
}
