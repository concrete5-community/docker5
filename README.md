# Docker images with ready-to use concrete5

This is the source repository for the Docker images hosted at [https://hub.docker.com/r/mlocati/docker5/](https://hub.docker.com/r/mlocati/docker5/).

They are really useful if you want to run a concrete5 instance without the hassle of configuring it.

For example, if you want to test your concrete5 package with concrete5 8.5.2, you can simply run this command:

```bash
docker run --rm -it -p 8080:80 mlocati/docker5:8.5.2-full -v /path/to/your/package:/app/packages/package_handle
```

Where:
- `8080` is the port where you'll browse the concrete5 website (available at `http://localhost:8080`)
- `/path/to/your/package` is the absolute path of the concrete5 package you are going to test (on Windows use `\` instead of `/`)
- `package_handle` is the handle of the package

You can then install the package through the web interface or through the CLI interface (`c5 c5:package:install package_handle`).

## Configuration parameters

- Password of the `admin` user: `12345`
- Name of the concrete5 database: `c5`
- Database user name: `c5`
- Database user password: `12345`
