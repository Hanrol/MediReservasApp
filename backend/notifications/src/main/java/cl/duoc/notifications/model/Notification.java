package cl.duoc.notifications.model;


import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import cl.duoc.notifications.enums.NotificationChannel;
import cl.duoc.notifications.enums.NotificationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @Column(name = "notification_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Column(name = "user_id", nullable = false)
    private Long  userId;

    @ManyToOne
    @JoinColumn(name = "notification_template_id")
    private NotificationTemplate notificationTemplate;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_channel", nullable = false, length = 30)
    private NotificationChannel notificationChannel;

    @Column(name = "notification_title", nullable = false)
    @Size(max  = 100)
    private String notificationTitle;

    @Column(name = "notification_message", nullable =  false, columnDefinition = "TEXT")
    private String notificationMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_status", nullable = false, length = 80)
    private NotificationStatus notificationStatus = NotificationStatus.PENDING;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;



}
