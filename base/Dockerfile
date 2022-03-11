FROM ubuntu:20.04

ENV C5_SUDOAS=www-data

ARG DEBIAN_FRONTEND=noninteractive

ARG PHP_VERSIONS="5.6 7.4 8.1"
ARG PHP_EXTENSIONS_VSPECIFIC="bcmath bz2 curl exif ftp gd gmp imagick imap intl json ldap mbstring mysql opcache pdo soap ssh2 xml xsl zip"
ARG PHP_EXTENSIONS_COMMON="php-redis"

COPY assets/ccm-service /usr/local/bin/
COPY assets/switch-php /usr/local/bin/
COPY assets/switch-composer /usr/local/bin/
COPY assets/entrypoint.sh /
COPY assets/bashrc /root/.bashrc
COPY build /

ADD https://raw.githubusercontent.com/concrete5-community/cli/master/c5 /usr/local/bin/
ADD https://raw.githubusercontent.com/concrete5-community/cli/master/composerpkg /usr/local/bin/

EXPOSE 80
EXPOSE 3306
EXPOSE 9000

RUN /build && rm /build

COPY assets/nginx.conf /etc/nginx/sites-available/default

WORKDIR /app

ENTRYPOINT [ "/entrypoint.sh" ]
