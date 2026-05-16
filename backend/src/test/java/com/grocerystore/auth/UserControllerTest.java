package com.grocerystore.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import({com.grocerystore.config.SecurityConfig.class, JwtAuthFilter.class, JwtService.class,
         com.grocerystore.common.GlobalExceptionHandler.class})
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean StoreUserRepository userRepository;
    @MockBean BCryptPasswordEncoder passwordEncoder;

    private static final UUID STORE_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private StoreUser staffUser() {
        StoreUser u = new StoreUser();
        u.setStoreId(STORE_ID);
        u.setName("Nguyen Van A");
        u.setRole(UserRole.STAFF);
        u.setActive(true);
        return u;
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void listStaff_returnsStaffList() throws Exception {
        when(userRepository.findByStoreIdAndRole(STORE_ID, UserRole.STAFF))
                .thenReturn(List.of(staffUser()));

        mockMvc.perform(get("/api/v1/users").param("storeId", STORE_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Nguyen Van A"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void createStaff_returns201() throws Exception {
        StoreUser saved = staffUser();
        when(passwordEncoder.encode(any())).thenReturn("$hashed$");
        when(userRepository.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UserRequest("Nguyen Van A", "1234", STORE_ID))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Nguyen Van A"));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void createStaff_asStaff_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UserRequest("Test", "1234", STORE_ID))))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void deactivate_returns200() throws Exception {
        StoreUser user = staffUser();
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(patch("/api/v1/users/{userId}/deactivate", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }
}
