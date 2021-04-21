package y.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import y.domain.Photo;

/**
 * Spring Data SQL repository for the Photo entity.
 */
@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    @Query(
        value = "select distinct photo from Photo photo left join fetch photo.tags",
        countQuery = "select count(distinct photo) from Photo photo"
    )
    Page<Photo> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct photo from Photo photo left join fetch photo.tags")
    List<Photo> findAllWithEagerRelationships();

    @Query("select photo from Photo photo left join fetch photo.tags where photo.id =:id")
    Optional<Photo> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        // value = "select photo from Photo photo"
        value = "select photo from Photo photo where photo.album.user.login = ?#{principal.username}"
        // value = "select photoMy from Photo photoMy where photoMy.album.user.login = 'user'"

        // 작동하는 쿼리문
        // select photo0_.id as id1_4_, photo0_.album_id as album_id7_4_, photo0_.description as descript2_4_, photo0_.image as image3_4_,
        // photo0_.image_content_type as image_co4_4_, photo0_.taken as taken5_4_, photo0_.title as title6_4_
        // from photo photo0_ cross join album album1_ cross join jhi_user user2_
        // where photo0_.album_id=album1_.id and album1_.user_id=user2_.id and user2_.login='user' order by photo0_.id asc limit 5

        // value = "select photoMy from Photo photoMy where photoMy.id = 2"
        // value = "select photo.id, photo.title, album.id from Photo photo inner join Album album where album.user.login='user' limit 1"
        // cross join jhi_user user where user.login='user'
        // value = "select photo.id, photo.title, album.id from Photo photo right join Album album  where photo.album_id=album.id limit 1"
        // select photo0_.id, photo0_.album_id, photo0_.description, photo0_.image, photo0_.image_content_type, photo0_.taken, photo0_.title from photo photo0_ cross join album album1_ cross join jhi_user user2_ where photo0_.album_id=album1_.id and album1_.user_id=user2_.id and user2_.login='user';
    )
    Page<Photo> findAllByIdMy(Pageable pageable);
}
