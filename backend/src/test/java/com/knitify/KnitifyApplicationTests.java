package com.knitify;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class KnitifyApplicationTests {
    @Test
    void applicationClassIsAvailable() {
        assertThat(KnitifyApplication.class).isNotNull();
    }
}
