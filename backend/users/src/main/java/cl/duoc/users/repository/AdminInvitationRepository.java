package cl.duoc.users.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.users.model.AdminInvitation;

public interface AdminInvitationRepository extends JpaRepository<AdminInvitation, Long> {

    Optional<AdminInvitation> findByTokenHash(String tokenHash);

    Optional<AdminInvitation> findFirstByEmailIgnoreCaseAndAcceptedAtIsNullAndCanceledAtIsNullOrderByCreatedAtDesc(String email);

    List<AdminInvitation> findAllByAcceptedAtIsNullOrderByCreatedAtDesc();
}
