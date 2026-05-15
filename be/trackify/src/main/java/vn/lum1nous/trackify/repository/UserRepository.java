package vn.lum1nous.trackify.repository;

import java.util.Optional;
import java.util.UUID;
import vn.lum1nous.trackify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);
}
