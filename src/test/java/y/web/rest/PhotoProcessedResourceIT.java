package y.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;
import y.IntegrationTest;
import y.domain.Photo;
import y.domain.PhotoProcessed;
import y.repository.PhotoProcessedRepository;
import y.repository.PhotoRepository;

/**
 * Integration tests for the {@link PhotoProcessedResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class PhotoProcessedResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/photo-processeds";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private PhotoProcessedRepository photoProcessedRepository;

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPhotoProcessedMockMvc;

    private PhotoProcessed photoProcessed;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PhotoProcessed createEntity(EntityManager em) {
        PhotoProcessed photoProcessed = new PhotoProcessed().title(DEFAULT_TITLE).description(DEFAULT_DESCRIPTION).created(DEFAULT_CREATED);
        // Add required entity
        Photo photo;
        if (TestUtil.findAll(em, Photo.class).isEmpty()) {
            photo = PhotoResourceIT.createEntity(em);
            em.persist(photo);
            em.flush();
        } else {
            photo = TestUtil.findAll(em, Photo.class).get(0);
        }
        photoProcessed.setPhoto(photo);
        return photoProcessed;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PhotoProcessed createUpdatedEntity(EntityManager em) {
        PhotoProcessed photoProcessed = new PhotoProcessed().title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).created(UPDATED_CREATED);
        // Add required entity
        Photo photo;
        if (TestUtil.findAll(em, Photo.class).isEmpty()) {
            photo = PhotoResourceIT.createUpdatedEntity(em);
            em.persist(photo);
            em.flush();
        } else {
            photo = TestUtil.findAll(em, Photo.class).get(0);
        }
        photoProcessed.setPhoto(photo);
        return photoProcessed;
    }

    @BeforeEach
    public void initTest() {
        photoProcessed = createEntity(em);
    }

    @Test
    @Transactional
    void createPhotoProcessed() throws Exception {
        int databaseSizeBeforeCreate = photoProcessedRepository.findAll().size();
        // Create the PhotoProcessed
        restPhotoProcessedMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(photoProcessed))
            )
            .andExpect(status().isCreated());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeCreate + 1);
        PhotoProcessed testPhotoProcessed = photoProcessedList.get(photoProcessedList.size() - 1);
        assertThat(testPhotoProcessed.getTitle()).isEqualTo(DEFAULT_TITLE);
        assertThat(testPhotoProcessed.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testPhotoProcessed.getCreated()).isEqualTo(DEFAULT_CREATED);

        // Validate the id for MapsId, the ids must be same
        assertThat(testPhotoProcessed.getId()).isEqualTo(testPhotoProcessed.getPhoto().getId());
    }

    @Test
    @Transactional
    void createPhotoProcessedWithExistingId() throws Exception {
        // Create the PhotoProcessed with an existing ID
        photoProcessed.setId(1L);

        int databaseSizeBeforeCreate = photoProcessedRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPhotoProcessedMockMvc
            .perform(
                post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(photoProcessed))
            )
            .andExpect(status().isBadRequest());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void updatePhotoProcessedMapsIdAssociationWithNewId() throws Exception {
        // Initialize the database
        photoProcessedRepository.saveAndFlush(photoProcessed);
        int databaseSizeBeforeCreate = photoProcessedRepository.findAll().size();

        // Add a new parent entity
        Photo photo = PhotoResourceIT.createUpdatedEntity(em);
        em.persist(photo);
        em.flush();

        // Load the photoProcessed
        PhotoProcessed updatedPhotoProcessed = photoProcessedRepository.findById(photoProcessed.getId()).get();
        assertThat(updatedPhotoProcessed).isNotNull();
        // Disconnect from session so that the updates on updatedPhotoProcessed are not directly saved in db
        em.detach(updatedPhotoProcessed);

        // Update the Photo with new association value
        updatedPhotoProcessed.setPhoto(photo);

        // Update the entity
        restPhotoProcessedMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedPhotoProcessed.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedPhotoProcessed))
            )
            .andExpect(status().isOk());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeCreate);
        PhotoProcessed testPhotoProcessed = photoProcessedList.get(photoProcessedList.size() - 1);
        // Validate the id for MapsId, the ids must be same
        // Uncomment the following line for assertion. However, please note that there is a known issue and uncommenting will fail the test.
        // Please look at https://github.com/jhipster/generator-jhipster/issues/9100. You can modify this test as necessary.
        // assertThat(testPhotoProcessed.getId()).isEqualTo(testPhotoProcessed.getPhoto().getId());
    }

    @Test
    @Transactional
    void getAllPhotoProcesseds() throws Exception {
        // Initialize the database
        photoProcessedRepository.saveAndFlush(photoProcessed);

        // Get all the photoProcessedList
        restPhotoProcessedMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(photoProcessed.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].created").value(hasItem(DEFAULT_CREATED.toString())));
    }

    @Test
    @Transactional
    void getPhotoProcessed() throws Exception {
        // Initialize the database
        photoProcessedRepository.saveAndFlush(photoProcessed);

        // Get the photoProcessed
        restPhotoProcessedMockMvc
            .perform(get(ENTITY_API_URL_ID, photoProcessed.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(photoProcessed.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.created").value(DEFAULT_CREATED.toString()));
    }

    @Test
    @Transactional
    void getNonExistingPhotoProcessed() throws Exception {
        // Get the photoProcessed
        restPhotoProcessedMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewPhotoProcessed() throws Exception {
        // Initialize the database
        photoProcessedRepository.saveAndFlush(photoProcessed);

        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();

        // Update the photoProcessed
        PhotoProcessed updatedPhotoProcessed = photoProcessedRepository.findById(photoProcessed.getId()).get();
        // Disconnect from session so that the updates on updatedPhotoProcessed are not directly saved in db
        em.detach(updatedPhotoProcessed);
        updatedPhotoProcessed.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).created(UPDATED_CREATED);

        restPhotoProcessedMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedPhotoProcessed.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedPhotoProcessed))
            )
            .andExpect(status().isOk());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
        PhotoProcessed testPhotoProcessed = photoProcessedList.get(photoProcessedList.size() - 1);
        assertThat(testPhotoProcessed.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testPhotoProcessed.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testPhotoProcessed.getCreated()).isEqualTo(UPDATED_CREATED);
    }

    @Test
    @Transactional
    void putNonExistingPhotoProcessed() throws Exception {
        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();
        photoProcessed.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPhotoProcessedMockMvc
            .perform(
                put(ENTITY_API_URL_ID, photoProcessed.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(photoProcessed))
            )
            .andExpect(status().isBadRequest());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPhotoProcessed() throws Exception {
        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();
        photoProcessed.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPhotoProcessedMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(photoProcessed))
            )
            .andExpect(status().isBadRequest());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPhotoProcessed() throws Exception {
        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();
        photoProcessed.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPhotoProcessedMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(photoProcessed)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePhotoProcessedWithPatch() throws Exception {
        // Initialize the database
        photoProcessedRepository.saveAndFlush(photoProcessed);

        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();

        // Update the photoProcessed using partial update
        PhotoProcessed partialUpdatedPhotoProcessed = new PhotoProcessed();
        partialUpdatedPhotoProcessed.setId(photoProcessed.getId());

        partialUpdatedPhotoProcessed.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION);

        restPhotoProcessedMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPhotoProcessed.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedPhotoProcessed))
            )
            .andExpect(status().isOk());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
        PhotoProcessed testPhotoProcessed = photoProcessedList.get(photoProcessedList.size() - 1);
        assertThat(testPhotoProcessed.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testPhotoProcessed.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testPhotoProcessed.getCreated()).isEqualTo(DEFAULT_CREATED);
    }

    @Test
    @Transactional
    void fullUpdatePhotoProcessedWithPatch() throws Exception {
        // Initialize the database
        photoProcessedRepository.saveAndFlush(photoProcessed);

        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();

        // Update the photoProcessed using partial update
        PhotoProcessed partialUpdatedPhotoProcessed = new PhotoProcessed();
        partialUpdatedPhotoProcessed.setId(photoProcessed.getId());

        partialUpdatedPhotoProcessed.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).created(UPDATED_CREATED);

        restPhotoProcessedMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPhotoProcessed.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedPhotoProcessed))
            )
            .andExpect(status().isOk());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
        PhotoProcessed testPhotoProcessed = photoProcessedList.get(photoProcessedList.size() - 1);
        assertThat(testPhotoProcessed.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testPhotoProcessed.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testPhotoProcessed.getCreated()).isEqualTo(UPDATED_CREATED);
    }

    @Test
    @Transactional
    void patchNonExistingPhotoProcessed() throws Exception {
        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();
        photoProcessed.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPhotoProcessedMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, photoProcessed.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(photoProcessed))
            )
            .andExpect(status().isBadRequest());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPhotoProcessed() throws Exception {
        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();
        photoProcessed.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPhotoProcessedMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(photoProcessed))
            )
            .andExpect(status().isBadRequest());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPhotoProcessed() throws Exception {
        int databaseSizeBeforeUpdate = photoProcessedRepository.findAll().size();
        photoProcessed.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPhotoProcessedMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(photoProcessed))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the PhotoProcessed in the database
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePhotoProcessed() throws Exception {
        // Initialize the database
        photoProcessedRepository.saveAndFlush(photoProcessed);

        int databaseSizeBeforeDelete = photoProcessedRepository.findAll().size();

        // Delete the photoProcessed
        restPhotoProcessedMockMvc
            .perform(delete(ENTITY_API_URL_ID, photoProcessed.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<PhotoProcessed> photoProcessedList = photoProcessedRepository.findAll();
        assertThat(photoProcessedList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
