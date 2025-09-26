package com.workflow.management.controller;

import com.workflow.management.dto.ApiResponse;
import com.workflow.management.dto.LoginRequest;
import com.workflow.management.dto.LoginResponse;
import com.workflow.management.dto.RegisterRequest;
import com.workflow.management.entity.User;
import com.workflow.management.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("POST /api/auth/login - User login attempt: {}", loginRequest.getUsername());
        LoginResponse loginResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("POST /api/auth/register - User registration attempt: {}", registerRequest.getUsername());
        User user = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully: " + user.getUsername()));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<String>> validateToken() {
        logger.debug("GET /api/auth/validate - Token validation request");
        return ResponseEntity.ok(ApiResponse.success("Token is valid"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        logger.info("POST /api/auth/logout - User logout request");
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken() {
        logger.info("POST /api/auth/refresh - Token refresh request");
        String username = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        LoginResponse refreshedToken = authService.refreshToken(username);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", refreshedToken));
    }
}
