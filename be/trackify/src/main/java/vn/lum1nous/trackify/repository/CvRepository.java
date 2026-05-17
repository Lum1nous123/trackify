package vn.lum1nous.trackify.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.lum1nous.trackify.entity.Cv;

public interface CvRepository extends JpaRepository<Cv, UUID> {

    Optional<Cv> findByIdAndUser_Id(UUID id, UUID userId);

    Optional<Cv> findByUser_IdAndIsActive(UUID userId, boolean isActive);
}
