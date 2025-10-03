package com.workflow.management.service;

import com.workflow.management.dto.UserDTO;
import com.workflow.management.entity.User;
import com.workflow.management.exception.ResourceNotFoundException;
import com.workflow.management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public UserDTO getCurrentUserDTO() {
        User user = getCurrentUser();
        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        logger.info("Fetching all users");
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        logger.info("Fetching user by id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return convertToDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        logger.info("Fetching user by username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return convertToDTO(user);
    }

    public List<UserDTO> getUsersByRole(String roleType) {
        logger.info("Fetching users by role: {}", roleType);
        try {
            com.workflow.management.entity.RoleType role = com.workflow.management.entity.RoleType.valueOf(roleType.toUpperCase());
            return userRepository.findByRoles_Name(role).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Role", "type", roleType);
        }
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList()));
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
