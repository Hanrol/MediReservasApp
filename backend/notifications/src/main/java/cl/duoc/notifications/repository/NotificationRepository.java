package cl.duoc.notifications.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.notifications.enums.NotificationStatus;
import cl.duoc.notifications.model.Notification;

import java.time.LocalDateTime;




@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>{
    
    List<Notification> findByUserId(Long userId);

    List<Notification> findByNotificationStatus(NotificationStatus status);

    List<Notification> findByUserIdAndNotificationStatus(Long userId, NotificationStatus status);
 
    List<Notification> findBySentAtIsNull();

    List<Notification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Notification> findByNotificationTemplate(cl.duoc.notifications.model.NotificationTemplate template);

    long countByNotificationStatus(NotificationStatus status);
}
