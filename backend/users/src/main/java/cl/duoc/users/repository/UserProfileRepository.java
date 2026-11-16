package cl.duoc.users.repository;

import java.util.Optional;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.users.model.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUserUserId(Long userId);

    boolean existsByUserUserId(Long userId);

    List<UserProfile> findAllByUserUserIdIn(Collection<Long> userIds);
}
