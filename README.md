# Docker images with ready-to use ConcreteCMS

Docker images that provide pre-installed ConcreteCMS instances without the hassle of configuring them.

Example: if you want to test your ConcreteCMS package with ConcreteCMS 8.5.4, you can simply run this command:

```bash
docker run --rm -it -p 8080:80 -p 33306:3306 -v /path/to/your/package:/app/packages/package_handle ghcr.io/concrete5-community/docker5:8.5.4-full
```

Where:
- `8080` is the port where you'll browse the ConcreteCMS website (available at `http://localhost:8080`)
- `/path/to/your/package` is the absolute path of the ConcreteCMS package you are going to test (on Windows use `\` instead of `/`)
- `package_handle` is the handle of the package

You can then install the package through the web interface or through the CLI interface (`c5 c5:package:install package_handle`).

## References

Pre-compiled images: https://github.com/concrete5-community/docker5/pkgs/container/docker5

Source repository: https://github.com/concrete5-community/docker5

## Configuration parameters

- Password of the `admin` user: `12345`
- Name of the ConcreteCMS database: `c5`
- Database user name: `c5`
- Database user password: `12345`
- Exposed port for the website: `80`
- Exposed port for the database: `3306`

## Additional CLI commands

docker5 images come with some service CLI commands.
You can get a list of them by running the `ccm-help` CLI command.

## PHP Versions

Every docker image contains multiple PHP versions: 5.6, 7.4, 8.1, and 8.2.

When using the default entry point you can override the default one by specifying the `CCM_PHP_VERSION` environment variable, like this:

```bash
docker run --rm -e "CCM_PHP_VERSION=7.4" ghcr.io/concrete5-community/docker5:8.5.4-full
```

From within the container you can use the `switch-php` command:

```bash
switch-php 7.4
```

## Composer Versions

Every docker image contains both composer v1 and composer v2.

When using the default entry point you can override the default one by specifying the `CCM_COMPOSER_VERSION` environment variable, like this:

```bash
docker run --rm -e "CCM_COMPOSER_VERSION=2" ghcr.io/concrete5-community/docker5:9.0.2-full
```

From within the container you can use the `switch-composer` command:

```bash
switch-composer 2
```

## PHPUnit Versions

Every docker image contains many PHPUnit versions.

When using the default entry point you can override the default one by specifying the `CCM_PHPUNIT_VERSION` environment variable, like this:

```bash
docker run --rm -e "CCM_PHPUNIT_VERSION=10" ghcr.io/concrete5-community/docker5:9.0.2-full
```

From within the container you can use the `switch-phpunit` command:

```bash
switch-phpunit 10
```

## Starting/stopping services

The default entry point will start the database and web services at startup, and stop them at shutdown.

You can also control them by using the `ccm-service` command to start/stop/restart these services, as well as to determine if they are running.

```bash
# Start all the services
ccm-service start
# Stop all the services
ccm-service stop
# Restart only the database service
ccm-service restart db
# Check if the PHP-FPM service and the Nginx services are running
ccm-service status php-fpm nginx
```

## Notifications

This repository contains a copuple of scheduled GitHub Actions.
If you want to be notified about problems, you can subscribe to [this Telegram channel](https://t.me/Docker5Notifications).
