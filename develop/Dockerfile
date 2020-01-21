FROM mlocati/docker5:base

RUN \
    cd /app && \
    ccm-start && \
    curl -sSL https://github.com/concrete5/concrete5/archive/develop.tar.gz | sudo -u www-data -- tar xz --strip 1 && \
    sudo -u www-data -- composer install --optimize-autoloader --no-suggest && \
    sudo -u www-data -- composer clear-cache && \
    c5 c5:install \
        --db-server=localhost \
        --db-username=c5 \
        --db-password=12345 \
        --db-database=c5 \
        --timezone=UTC \
        --site='concrete5 website' \
        --starting-point=elemental_full \
        --admin-email=admin@example.org \
        --admin-password=12345 \
        && \
    \
    ccm-stop && \
    echo 'Ready.'
