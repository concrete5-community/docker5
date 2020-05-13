FROM ubuntu:20.04

ENV C5_SUDOAS=www-data

ARG DEBIAN_FRONTEND=noninteractive

ARG ONDREJPHP_KEY="4F4EA0AAE5267A6C"
ARG ONDRENGINX_KEY="4F4EA0AAE5267A6C"
ARG PHP_VERSIONS="5.6 7.2 7.4"
ARG PHP_EXTENSIONS_VSPECIFIC="bcmath bz2 curl exif ftp gd gmp imagick imap intl json ldap mbstring mysql opcache pdo soap ssh2 xml xsl zip"
ARG PHP_EXTENSIONS_COMMON="php-redis"

COPY assets/ccm-service /usr/local/bin/
COPY assets/switch-php /usr/local/bin/
COPY assets/entrypoint.sh /
COPY assets/bashrc /root/.bashrc

ADD https://raw.githubusercontent.com/concrete5/cli/master/c5 /usr/local/bin/
ADD https://raw.githubusercontent.com/concrete5/cli/master/composerpkg /usr/local/bin/

EXPOSE 80
EXPOSE 3306
EXPOSE 9000

RUN \
    echo '' && \
    echo '###################' && \
    echo '# Updating system #' && \
    echo '###################' && \
    apt-get update -qq && \
    apt-get upgrade -yqq && \
    apt-get autoremove --purge -yqq && \
    apt-get install -yqq --no-install-recommends apt-transport-https ca-certificates curl git gnupg2 sudo unzip && \
    echo 'Set disable_coredump false' >> /etc/sudo.conf && \
    \
    echo '' && \
    echo '###############################' && \
    echo '# Configuring helper commands #' && \
    echo '###############################' && \
    chmod 0755 \
        /usr/local/bin/ccm-service \
        /usr/local/bin/switch-php \
        /usr/local/bin/c5 \
        /usr/local/bin/composerpkg \
        /entrypoint.sh \
        && \
    \
    echo '' && \
    echo '######################' && \
    echo '# Installing PHP FPM #' && \
    echo '######################' && \
    printf 'deb http://ppa.launchpad.net/ondrej/php/ubuntu %s main\n' "$(. /etc/os-release && echo $VERSION_CODENAME)" >/etc/apt/sources.list.d/ondrej-php.list && \
    APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1 apt-key adv --keyserver keyserver.ubuntu.com --recv-keys $ONDREJPHP_KEY && \
    apt-get update -qq && \
    APT_PACKAGES='' && \
    for PHP_VERSION in $PHP_VERSIONS; do \
        APT_PACKAGES="$APT_PACKAGES php$PHP_VERSION-fpm"; \
        for PHP_EXTENSION in $PHP_EXTENSIONS_VSPECIFIC; do \
            APT_PACKAGES="$APT_PACKAGES php$PHP_VERSION-$PHP_EXTENSION"; \
        done \
    done; \
    APT_PACKAGES="$APT_PACKAGES $PHP_EXTENSIONS_COMMON" && \
    apt-get install -yqq --no-install-recommends $APT_PACKAGES && \
    unset APT_PACKAGES && \
    unset PHP_VERSION && \
    unset PHP_EXTENSION && \
    \
    echo '' && \
    echo '#####################' && \
    echo '# Installing NodeJS #' && \
    echo '#####################' && \
    curl -sSL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -yqq --no-install-recommends nodejs && \
    npm -g install grunt-cli && \
    \
    echo '' && \
    echo '######################' && \
    echo '# Installing MariaDB #' && \
    echo '######################' && \
    curl -sSL https://downloads.mariadb.com/MariaDB/mariadb_repo_setup | bash -s -- --skip-maxscale --mariadb-server-version=mariadb-10.4 && \
    apt-get install -yqq --no-install-recommends mariadb-server && \
    \
    echo '' && \
    echo '####################' && \
    echo '# Installing Nginx #' && \
    echo '####################' && \
    printf 'deb http://ppa.launchpad.net/ondrej/nginx/ubuntu %s main\n' "$(. /etc/os-release && echo $VERSION_CODENAME)" >/etc/apt/sources.list.d/ondrej-nginx.list && \
    APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1 apt-key adv --keyserver keyserver.ubuntu.com --recv-keys $ONDRENGINX_KEY && \
    apt-get update -yqq && \
    apt-get install -yqq --no-install-recommends nginx && \
    \
    echo '' && \
    echo '#######################' && \
    echo '# Installing Composer #' && \
    echo '#######################' && \
    mkdir -p /var/www/.composer && \
    chown -R www-data:www-data /var/www/.composer && \
    curl -sSL https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    (sudo -H -u www-data -- composer global require hirak/prestissimo || true) && \
    (sudo -H -u www-data -- composer clear-cache || true) && \
    \
    echo '' && \
    echo '########################' && \
    echo '# Configuring database #' && \
    echo '########################' && \
    sed -i -r 's/^(\s*bind-address\s*=\s*)127\.0\.0\.1(\s*)$/\10.0.0.0\2/' /etc/mysql/my.cnf && \
    sed -i -r 's/^(\s*innodb_flush_method\s*=\s*)\S.*?(\s*)$/\1fsync\2/' /etc/mysql/my.cnf && \
    (test -f /etc/mysql/mariadb.conf.d/50-server.cnf && sed -i -r 's/^(\s*bind-address\s*=\s*)127\.0\.0\.1(\s*)$/\10.0.0.0\2/' /etc/mysql/mariadb.conf.d/50-server.cnf || true) && \
    (test -f /etc/mysql/mariadb.conf.d/50-server.cnf && echo 'innodb_flush_method = fsync' >> /etc/mysql/mariadb.conf.d/50-server.cnf || true) && \
    ccm-service start db && \
    echo "CREATE USER 'c5'@'%' IDENTIFIED BY '12345'; CREATE DATABASE c5 COLLATE 'utf8mb4_unicode_ci'; GRANT ALL PRIVILEGES ON c5.* TO 'c5'@'%'; FLUSH PRIVILEGES;" | mysql && \
    \
    echo '' && \
    echo '####################' && \
    echo '# Final operations #' && \
    echo '####################' && \
    mkdir /app && \
    chown www-data:www-data /app && \
    ccm-service stop && \
    rm -rf /var/lib/apt/lists/* && \
    npm cache clean --force && \
    rm -rf $HOME/.npm/_logs/*.log && \
    truncate --size=0 /var/log/*.log /var/log/apt/*.log && \
    rm -rf /var/log/apt/eipp.log.xz && \
    \
    echo '' && \
    echo 'Ready.'

COPY assets/nginx.conf /etc/nginx/sites-available/default

WORKDIR /app

ENTRYPOINT [ "/entrypoint.sh" ]
