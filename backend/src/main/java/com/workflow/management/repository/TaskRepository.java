package com.workflow.management.repository;

import com.workflow.management.entity.Task;
import com.workflow.management.entity.TaskStatus;
import com.workflow.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedTo(User user);

    List<Task> findByCreatedBy(User user);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByAssignedToAndStatus(User user, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId OR t.createdBy.id = :userId")
    List<Task> findAllTasksForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId AND t.status = :status")
    Long countByAssignedToAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Task> searchTasks(@Param("query") String query);
}
