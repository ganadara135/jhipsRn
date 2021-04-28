package y.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import y.domain.PhotoProcessed;
import y.repository.PhotoProcessedRepository;
import y.repository.PhotoRepository;
import y.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link y.domain.PhotoProcessed}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class PhotoProcessedResource {

    private final Logger log = LoggerFactory.getLogger(PhotoProcessedResource.class);

    private static final String ENTITY_NAME = "photoProcessed";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PhotoProcessedRepository photoProcessedRepository;

    private final PhotoRepository photoRepository;

    public PhotoProcessedResource(PhotoProcessedRepository photoProcessedRepository, PhotoRepository photoRepository) {
        this.photoProcessedRepository = photoProcessedRepository;
        this.photoRepository = photoRepository;
    }

    /**
     * {@code POST  /photo-processeds} : Create a new photoProcessed.
     *
     * @param photoProcessed the photoProcessed to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new photoProcessed, or with status {@code 400 (Bad Request)} if the photoProcessed has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/photo-processeds")
    public ResponseEntity<PhotoProcessed> createPhotoProcessed(@RequestBody PhotoProcessed photoProcessed) throws URISyntaxException {
        log.debug("REST request to save PhotoProcessed : {}", photoProcessed);
        if (photoProcessed.getId() != null) {
            throw new BadRequestAlertException("A new photoProcessed cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (Objects.isNull(photoProcessed.getPhoto())) {
            throw new BadRequestAlertException("Invalid association value provided", ENTITY_NAME, "null");
        }
        Long photoId = photoProcessed.getPhoto().getId();
        photoRepository.findById(photoId).ifPresent(photoProcessed::photo);
        PhotoProcessed result = photoProcessedRepository.save(photoProcessed);
        return ResponseEntity
            .created(new URI("/api/photo-processeds/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /photo-processeds/:id} : Updates an existing photoProcessed.
     *
     * @param id the id of the photoProcessed to save.
     * @param photoProcessed the photoProcessed to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated photoProcessed,
     * or with status {@code 400 (Bad Request)} if the photoProcessed is not valid,
     * or with status {@code 500 (Internal Server Error)} if the photoProcessed couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/photo-processeds/{id}")
    public ResponseEntity<PhotoProcessed> updatePhotoProcessed(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody PhotoProcessed photoProcessed
    ) throws URISyntaxException {
        log.debug("REST request to update PhotoProcessed : {}, {}", id, photoProcessed);
        if (photoProcessed.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, photoProcessed.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!photoProcessedRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        PhotoProcessed result = photoProcessedRepository.save(photoProcessed);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, photoProcessed.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /photo-processeds/:id} : Partial updates given fields of an existing photoProcessed, field will ignore if it is null
     *
     * @param id the id of the photoProcessed to save.
     * @param photoProcessed the photoProcessed to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated photoProcessed,
     * or with status {@code 400 (Bad Request)} if the photoProcessed is not valid,
     * or with status {@code 404 (Not Found)} if the photoProcessed is not found,
     * or with status {@code 500 (Internal Server Error)} if the photoProcessed couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/photo-processeds/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<PhotoProcessed> partialUpdatePhotoProcessed(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody PhotoProcessed photoProcessed
    ) throws URISyntaxException {
        log.debug("REST request to partial update PhotoProcessed partially : {}, {}", id, photoProcessed);
        if (photoProcessed.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, photoProcessed.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!photoProcessedRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PhotoProcessed> result = photoProcessedRepository
            .findById(photoProcessed.getId())
            .map(
                existingPhotoProcessed -> {
                    if (photoProcessed.getTitle() != null) {
                        existingPhotoProcessed.setTitle(photoProcessed.getTitle());
                    }
                    if (photoProcessed.getDescription() != null) {
                        existingPhotoProcessed.setDescription(photoProcessed.getDescription());
                    }
                    if (photoProcessed.getCreated() != null) {
                        existingPhotoProcessed.setCreated(photoProcessed.getCreated());
                    }

                    return existingPhotoProcessed;
                }
            )
            .map(photoProcessedRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, photoProcessed.getId().toString())
        );
    }

    /**
     * {@code GET  /photo-processeds} : get all the photoProcesseds.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of photoProcesseds in body.
     */
    @GetMapping("/photo-processeds")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PhotoProcessed>> getAllPhotoProcesseds(Pageable pageable) {
        log.debug("REST request to get a page of PhotoProcesseds");
        Page<PhotoProcessed> page = photoProcessedRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /photo-processeds/:id} : get the "id" photoProcessed.
     *
     * @param id the id of the photoProcessed to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the photoProcessed, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/photo-processeds/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<PhotoProcessed> getPhotoProcessed(@PathVariable Long id) {
        log.debug("REST request to get PhotoProcessed : {}", id);
        Optional<PhotoProcessed> photoProcessed = photoProcessedRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(photoProcessed);
    }

    /**
     * {@code DELETE  /photo-processeds/:id} : delete the "id" photoProcessed.
     *
     * @param id the id of the photoProcessed to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/photo-processeds/{id}")
    public ResponseEntity<Void> deletePhotoProcessed(@PathVariable Long id) {
        log.debug("REST request to delete PhotoProcessed : {}", id);
        photoProcessedRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
