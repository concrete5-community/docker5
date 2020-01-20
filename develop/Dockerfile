FROM php:7.2-fpm

ENV C5_SUDOAS=www-data

ARG DEBIAN_FRONTEND=noninteractive

ARG PHP_EXTENSIONS="gd pdo_mysql zip"

COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/bin/

EXPOSE 80

RUN \
    echo '### Updating system' && \
    apt-get update -q && \
    apt-get upgrade -yq && \
    apt-get install -yqq gnupg unzip sudo && \
    \
    echo '### Installing MariaDB' && \
    curl -sSL https://downloads.mariadb.com/MariaDB/mariadb_repo_setup | bash && \
    apt-get install -yqq mariadb-server && \
    /bin/sh -c '/usr/bin/mysqld_safe >/dev/null 2>&1 &' && \
    \
    echo '### Installing Nginx' && \
    curl -sSL -o nginx_signing.key https://nginx.org/keys/nginx_signing.key && \
    APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1 apt-key add nginx_signing.key && \
    rm nginx_signing.key && \
    echo "deb https://nginx.org/packages/debian/ $(. /etc/os-release; printf '%s' "$VERSION" | cut -d\( -f2 | cut -d\) -f1) nginx" >/etc/apt/sources.list.d/nginx.list && \
    apt-get update -q && \
    apt-get install -yqq nginx && \
    printf 'server {\n\
    listen 80;\n\
    listen [::]:80;\n\
    root /var/www/html/;\n\
    index index.html index.php;\n\
    location / {\n\
        try_files $uri $uri/ /index.php?$query_string;\n\
    }\n\
    location ~ \.php$ {\n\
        fastcgi_split_path_info ^(.+\.php)(/.+)$;\n\
        try_files $fastcgi_script_name =404;\n\
        set $path_info $fastcgi_path_info;\n\
        fastcgi_param PHP_VALUE "memory_limit=384M";\n\
        fastcgi_read_timeout 300;\n\
        fastcgi_param PHP_VALUE "max_execution_time=300";\n\
        fastcgi_param PATH_INFO $path_info;\n\
        fastcgi_index index.php;\n\
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n\
        fastcgi_param QUERY_STRING $query_string;\n\
        fastcgi_param REQUEST_METHOD $request_method;\n\
        fastcgi_param CONTENT_TYPE $content_type;\n\
        fastcgi_param CONTENT_LENGTH $content_length;\n\
        fastcgi_param SCRIPT_NAME $fastcgi_script_name;\n\
        fastcgi_param REQUEST_URI $request_uri;\n\
        fastcgi_param DOCUMENT_URI $document_uri;\n\
        fastcgi_param DOCUMENT_ROOT $document_root;\n\
        fastcgi_param SERVER_PROTOCOL $server_protocol;\n\
        fastcgi_param REQUEST_SCHEME $scheme;\n\
        fastcgi_param HTTPS $https if_not_empty;\n\
        fastcgi_param GATEWAY_INTERFACE CGI/1.1;\n\
        fastcgi_param SERVER_SOFTWARE nginx/$nginx_version;\n\
        fastcgi_param REMOTE_ADDR $remote_addr;\n\
        fastcgi_param REMOTE_PORT $remote_port;\n\
        fastcgi_param SERVER_ADDR $server_addr;\n\
        fastcgi_param SERVER_PORT $server_port;\n\
        fastcgi_param SERVER_NAME $server_name;\n\
        fastcgi_param REDIRECT_STATUS 200;\n\
        fastcgi_pass localhost:9000;\n\
    }\n\
}\n\
' >/etc/nginx/conf.d/default.conf && \
    \
    echo '### Creating helper commands' && \
    sed -i 's/^;pid\s*=\s*run\/php-fpm\.pid$/pid=\/run\/php-fpm.pid/' /usr/local/etc/php-fpm.conf && \
    printf '#!/bin/sh\n\
echo Stopping MariaDB...\n\
mysqladmin shutdown && echo done. || echo failed.\n\
echo Stopping nginx...\n\
service nginx stop && echo done. || echo failed.\n\
echo Stopping php-frm...\n\
kill -s3 $(cat /run/php-fpm.pid) && echo done. || echo failed.\n\
' >/usr/local/bin/ccm-stop && chmod +x /usr/local/bin/ccm-stop && \
    printf '#!/bin/sh\n\
echo Starting MariaDB...\n\
/bin/sh -c "/usr/bin/mysqld_safe >/dev/null 2>&1 &" && echo done. || echo failed.\n\
for i in $(seq 1 30); do\n\
    sleep 1\n\
    if mysqladmin status -s >/dev/null; then\n\
        break\n\
    fi\n\
done\n\
echo Starting nginx...\n\
service nginx restart && echo done. || echo failed.\n\
echo Starting php-frm...\n\
/bin/sh -c "php-fpm &" && echo done. || echo failed.\n\
' >/usr/local/bin/ccm-start && chmod +x /usr/local/bin/ccm-start && \
    \
    install-php-extensions $PHP_EXTENSIONS && \
    echo 'pdo_mysql.default_socket=/var/run/mysqld/mysqld.sock' >>/usr/local/etc/php/conf.d/docker-php-ext-pdo_mysql.ini && \
    \
    echo '### Installing Composer' && \
    curl -sSL https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    \
    echo '### Installing concrete5' && \
    echo "CREATE USER 'c5'@'localhost' IDENTIFIED BY '12345'; CREATE DATABASE c5 COLLATE 'utf8mb4_unicode_ci'; GRANT ALL PRIVILEGES ON c5.* TO 'c5'@'localhost'; FLUSH PRIVILEGES;" | mysql && \
    curl -sSL -o /usr/local/bin/c5 https://github.com/concrete5/cli/raw/master/c5 && chmod +x /usr/local/bin/c5 && \
    curl -sSL https://github.com/concrete5/concrete5/archive/develop.tar.gz | tar xz --strip 1 -C /var/www/html && \
    chown -R www-data:www-data /var/www/html && \
    sudo -u www-data -- composer --no-cache --working-dir=/var/www/html install -o && \
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
    echo '### Final operations' && \
    ccm-stop >/dev/null 2>&1 && \
    ccm-start && \
    curl -sSL -o /dev/null http://localhost && \
    ccm-stop && \
    echo 'Ready.'
