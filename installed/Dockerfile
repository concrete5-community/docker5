FROM mlocati/docker5:base

ARG CCM_PHP_VERSION=7.2
ARG CCM_C5_ARCHIVE=https://github.com/concrete5/concrete5/archive/develop.tar.gz
ARG CCM_STARTING_POINT=elemental_full

RUN \
    printf '## Configuring environment (with PHP %s)\n' "$CCM_PHP_VERSION" && \
    switch-php "$CCM_PHP_VERSION" && \
    cd /app && \
    ccm-service start db && \
    \
    printf '## Downloading and extracting %s\n' "$CCM_C5_ARCHIVE" && \
    if test "${CCM_C5_ARCHIVE##*.}" = 'gz'; then \
        curl -sSL "$CCM_C5_ARCHIVE" | sudo -u www-data -- tar xz --strip 1; \
    else \
        curl -sSL -o /tmp/c5.zip "$CCM_C5_ARCHIVE" && \
        sudo -u www-data -- mkdir /tmp/c5 && \
        sudo -u www-data -- unzip -q /tmp/c5.zip -d /tmp/c5 && \
        mv /tmp/c5/*/** /app && \
        rm -rf /tmp/c5.zip /tmp/c5 && \
        chmod +x concrete/bin/concrete5; \
    fi; \
    \
    if ! test -d concrete/vendor; then \
        printf '## Installing composer dependencies\n' && \
        sudo -H -u www-data -- composer install --optimize-autoloader --no-suggest && \
        sudo -H -u www-data -- composer clear-cache; \
    fi; \
    \
    printf '## Installing concrete5\n' && \
    c5 c5:install \
        --db-server=localhost \
        --db-username=c5 \
        --db-password=12345 \
        --db-database=c5 \
        --site='concrete5 website' \
        --starting-point=$CCM_STARTING_POINT \
        --admin-email=admin@example.org \
        --admin-password=12345 \
        && \
    c5 c5:config set -g concrete.seo.url_rewriting true && \
    \
    printf '## Final operations\n' && \
    ccm-service stop db && \
    echo 'Ready.'
