package y.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import y.domain.Album;

/**
 * Spring Data SQL repository for the Album entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
    @Query("select album from Album album where album.user.login = ?#{principal.username}")
    List<Album> findByUserIsCurrentUser();

    @Query(
        value = "select album from Album album where album.user.login = ?#{principal.username}"
        // value = "select album from Album album where album.user.login = 'user'"
        // value = "select id, title from Album album where user_id =:id",
        // countQuery = "select count(id) from Album album"
    )
    Page<Album> findAllByIdMy(Pageable pageable); // , @Param("login") String login);
    // Page<Album> findAllByIdMy(Pageable pageable, @Param("id") Long id);
}
