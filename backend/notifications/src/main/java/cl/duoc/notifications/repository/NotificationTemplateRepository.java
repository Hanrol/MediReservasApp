package cl.duoc.notifications.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.duoc.notifications.model.NotificationTemplate;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long>{

    List<NotificationTemplate> findByActiveTrue();


    boolean existsByTemplateCode(String code);
    
}
