# Docker images with ready-to use concrete5

Docker images that provide pre-installed concrete5 instances without the hassle of configuring them.

Example: if you want to test your concrete5 package with concrete5 8.5.2, you can simply run this command:

```bash
docker run --rm -it -p 8080:80 -p 33306:3306 -v /path/to/your/package:/app/packages/package_handle mlocati/docker5:8.5.2-full
```

Where:
- `8080` is the port where you'll browse the concrete5 website (available at `http://localhost:8080`)
- `/path/to/your/package` is the absolute path of the concrete5 package you are going to test (on Windows use `\` instead of `/`)
- `package_handle` is the handle of the package

You can then install the package through the web interface or through the CLI interface (`c5 c5:package:install package_handle`).

## References

Pre-compiled images: https://hub.docker.com/r/mlocati/docker5

Source repository: https://github.com/concrete5-community/docker5

## Configuration parameters

- Password of the `admin` user: `12345`
- Name of the concrete5 database: `c5`
- Database user name: `c5`
- Database user password: `12345`
- Exposed port for the website: `80`
- Exposed port for the database: `3306`

## PHP Versions

Every docker images contains multiple PHP versions: 5.6, 7.2 and 7.4.

When using the default entry point you can override the default one by specifying the CCM_PHP_VERSION environment variable, like this:

```bash
docker run --rm -e "CCM_PHP_VERSION=7.2" mlocati/docker5:8.5.2-full
```

From within the container you can use the `switch-php` command:

```bash
switch-php 7.2
```

## Starting/stopping services

The default entry point will start the database and web services at startup, and stop them at shutdown.

You can also control them by using the `ccm-service` command to start/stop/restart these services, as well as to determine if they are running.

```bash
# Start all the services
ccm-service start
# Stop all the services
ccm-service stop
# Restart only the databse service
ccm-service restart db
# Check if the PHP-FPM service and the Nginx services are running
ccm-service status php-fpm nginx
```
