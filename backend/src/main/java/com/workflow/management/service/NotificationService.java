package com.workflow.management.service;

import com.workflow.management.dto.NotificationDTO;
import com.workflow.management.entity.Notification;
import com.workflow.management.entity.NotificationType;
import com.workflow.management.entity.User;
import com.workflow.management.exception.ResourceNotFoundException;
import com.workflow.management.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    public Notification createNotification(User user, String message, NotificationType type) {
        logger.info("Creating notification for user: {}", user.getUsername());
        Notification notification = new Notification(user, message, type);
        Notification savedNotification = notificationRepository.save(notification);
        logger.info("Notification created successfully: {}", savedNotification.getId());
        return savedNotification;
    }

    public List<NotificationDTO> getNotificationsForCurrentUser() {
        User currentUser = userService.getCurrentUser();
        logger.info("Fetching notifications for user: {}", currentUser.getUsername());
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(currentUser);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications() {
        User currentUser = userService.getCurrentUser();
        logger.info("Fetching unread notifications for user: {}", currentUser.getUsername());
        List<Notification> notifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(currentUser, false);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Long getUnreadCount() {
        User currentUser = userService.getCurrentUser();
        logger.info("Fetching unread notification count for user: {}", currentUser.getUsername());
        return notificationRepository.countByUserAndIsRead(currentUser, false);
    }

    public NotificationDTO markAsRead(Long id) {
        logger.info("Marking notification as read: {}", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        // Verify the notification belongs to the current user
        User currentUser = userService.getCurrentUser();
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Notification", "id", id);
        }

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        logger.info("Notification marked as read: {}", id);
        return convertToDTO(updatedNotification);
    }

    public void markAllAsRead() {
        User currentUser = userService.getCurrentUser();
        logger.info("Marking all notifications as read for user: {}", currentUser.getUsername());
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(currentUser, false);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
        logger.info("All notifications marked as read for user: {}", currentUser.getUsername());
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
