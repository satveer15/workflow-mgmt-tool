package com.workflow.management.controller;

import com.workflow.management.dto.ApiResponse;
import com.workflow.management.dto.UserDTO;
import com.workflow.management.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        logger.debug("GET /api/users/me - Get current user profile");
        UserDTO userDTO = userService.getCurrentUserDTO();
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", userDTO));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        logger.info("GET /api/users - Get all users");
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        logger.info("GET /api/users/{} - Get user by id", id);
        UserDTO userDTO = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", userDTO));
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(@PathVariable String username) {
        logger.info("GET /api/users/username/{} - Get user by username", username);
        UserDTO userDTO = userService.getUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", userDTO));
    }

    @GetMapping("/role/{roleType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getUsersByRole(@PathVariable String roleType) {
        logger.info("GET /api/users/role/{} - Get users by role", roleType);
        List<UserDTO> users = userService.getUsersByRole(roleType);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }
}
