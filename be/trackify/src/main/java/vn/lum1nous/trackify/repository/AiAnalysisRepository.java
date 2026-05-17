package vn.lum1nous.trackify.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.lum1nous.trackify.entity.AiAnalysis;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, UUID> {

    Optional<AiAnalysis> findByCacheKey(String cacheKey);
}
