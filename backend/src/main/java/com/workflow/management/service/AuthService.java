package com.workflow.management.service;

import com.workflow.management.dto.LoginRequest;
import com.workflow.management.dto.LoginResponse;
import com.workflow.management.dto.RegisterRequest;
import com.workflow.management.entity.Role;
import com.workflow.management.entity.RoleType;
import com.workflow.management.entity.User;
import com.workflow.management.exception.BadRequestException;
import com.workflow.management.repository.RoleRepository;
import com.workflow.management.repository.UserRepository;
import com.workflow.management.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest loginRequest) {
        logger.info("User login attempt: {}", loginRequest.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        logger.info("User logged in successfully: {}", loginRequest.getUsername());
        return new LoginResponse(jwt, user.getUsername(), user.getEmail(), roles);
    }

    // TODO: Add validation for existing username/email
    // TODO: Add password strength validation
    public User register(RegisterRequest registerRequest) {
        logger.info("User registration attempt: {}", registerRequest.getUsername());

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        Set<Role> roles = new HashSet<>();
        if (registerRequest.getRole() != null && !registerRequest.getRole().isEmpty()) {
            try {
                RoleType roleType = RoleType.valueOf(registerRequest.getRole().toUpperCase());
                Role role = roleRepository.findByName(roleType)
                        .orElseThrow(() -> new BadRequestException("Role not found: " + registerRequest.getRole()));
                roles.add(role);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + registerRequest.getRole());
            }
        } else {
            Role defaultRole = roleRepository.findByName(RoleType.EMPLOYEE)
                    .orElseThrow(() -> new BadRequestException("Default role not found"));
            roles.add(defaultRole);
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        logger.info("User registered successfully: {}", savedUser.getUsername());
        return savedUser;
    }

    public void logout() {
        logger.info("User logout attempt");
        SecurityContextHolder.clearContext();
        logger.info("User logged out successfully");
    }
}
