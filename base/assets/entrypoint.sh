#!/bin/bash

if test -n "${CCM_PHP_VERSION:-}"; then
    if ! switch-php "$CCM_PHP_VERSION"; then
        exit 1
    fi
fi

if test -n "${CCM_COMPOSER_VERSION:-}"; then
    if ! switch-composer "$CCM_COMPOSER_VERSION"; then
        exit 1
    fi
fi

if ! ccm-service start; then
    echo 'Failed to start services' >&2
    ccm-service stop >/dev/null 2>&1
    exit 1
fi

rc=0
if test $# -eq 0; then
    if test "${TERM:-}" = 'dumb'; then
        cat << EOF

Running container until the following command will be executed:

    docker stop $(hostname)

PS: if you see this message, you probably need to run this container
    with the "-d" (detached) flag: if you hit CTRL-C (or close this
    terminal window) the container will keep running in background.

EOF
        trap true TERM INT
        sleep infinity &
        wait
    else
        cat << EOF

Available docker5 commands
- ccm-service
  Start, restart, stop Nginx and/or MariaDB and/or PHP-FPM
- switch-php
  Switch the PHP version used by the CLI and by Nginx
- switch-composer
  Switch the Composer version used by the CLI

Type "exit" (or CTRL-D) to quit this docker5 container

EOF
        bash
        rc=$?
    fi
else
    bash -c "$*"
    rc=$?
fi

ccm-service stop
exit $rc
