package y.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import y.domain.PhotoProcessed;

/**
 * Spring Data SQL repository for the PhotoProcessed entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PhotoProcessedRepository extends JpaRepository<PhotoProcessed, Long> {}
