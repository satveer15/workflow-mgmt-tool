package com.workflow.management.service;

import com.workflow.management.entity.Role;
import com.workflow.management.entity.RoleType;
import com.workflow.management.entity.User;
import com.workflow.management.repository.RoleRepository;
import com.workflow.management.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class DataInitializationService {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializationService.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        logger.info("Initializing database with default data...");
        createDefaultRoles();
        createDefaultUsers();
        logger.info("Database initialization completed");
    }

    private void createDefaultRoles() {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByName(roleType).isEmpty()) {
                Role role = new Role(roleType);
                roleRepository.save(role);
                logger.info("Created role: {}", roleType);
            }
        }
    }

    private void createDefaultUsers() {
        // Create admin user if not exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@workflow.com");
            admin.setPassword(passwordEncoder.encode("admin123"));

            Set<Role> adminRoles = new HashSet<>();
            roleRepository.findByName(RoleType.ADMIN).ifPresent(adminRoles::add);
            admin.setRoles(adminRoles);

            userRepository.save(admin);
            logger.info("Created default admin user - username: admin, password: admin123");
        }

        // Create manager user if not exists
        if (userRepository.findByUsername("manager").isEmpty()) {
            User manager = new User();
            manager.setUsername("manager");
            manager.setEmail("manager@workflow.com");
            manager.setPassword(passwordEncoder.encode("manager123"));

            Set<Role> managerRoles = new HashSet<>();
            roleRepository.findByName(RoleType.MANAGER).ifPresent(managerRoles::add);
            manager.setRoles(managerRoles);

            userRepository.save(manager);
            logger.info("Created default manager user - username: manager, password: manager123");
        }

        // Create employee user if not exists
        if (userRepository.findByUsername("employee").isEmpty()) {
            User employee = new User();
            employee.setUsername("employee");
            employee.setEmail("employee@workflow.com");
            employee.setPassword(passwordEncoder.encode("employee123"));

            Set<Role> employeeRoles = new HashSet<>();
            roleRepository.findByName(RoleType.EMPLOYEE).ifPresent(employeeRoles::add);
            employee.setRoles(employeeRoles);

            userRepository.save(employee);
            logger.info("Created default employee user - username: employee, password: employee123");
        }
    }
}
