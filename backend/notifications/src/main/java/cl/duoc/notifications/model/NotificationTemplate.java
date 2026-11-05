package cl.duoc.notifications.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notification_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplate {

    @Id
    @Column(name = "notification_template_id")
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long notificationTemplateId;

    @Column (name = "template_code", nullable = false, unique = true)
    @Size(max = 80)
    private String templateCode;

    @Column (name = "template_title", nullable = false)
    @Size(max = 100)
    private String templateTitle;

    @Column (name = "template_body", nullable = false, columnDefinition = "TEXT")
    private String templateBody;

    @Column(name = "active", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "notificationTemplate")
    private List<Notification> notifications = new ArrayList<>();

    
}
