package y.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import y.web.rest.TestUtil;

class PhotoProcessedTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PhotoProcessed.class);
        PhotoProcessed photoProcessed1 = new PhotoProcessed();
        photoProcessed1.setId(1L);
        PhotoProcessed photoProcessed2 = new PhotoProcessed();
        photoProcessed2.setId(photoProcessed1.getId());
        assertThat(photoProcessed1).isEqualTo(photoProcessed2);
        photoProcessed2.setId(2L);
        assertThat(photoProcessed1).isNotEqualTo(photoProcessed2);
        photoProcessed1.setId(null);
        assertThat(photoProcessed1).isNotEqualTo(photoProcessed2);
    }
}
