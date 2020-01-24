# Docker images with ready-to use concrete5

Docker images that provide pre-installed concrete5 instances without the hassle of configuring them.

Example: if you want to test your concrete5 package with concrete5 8.5.2, you can simply run this command:

```bash
docker run --rm -it -p 8080:80 -v /path/to/your/package:/app/packages/package_handle mlocati/docker5:8.5.2-full
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
