#!/bin/bash

if ! ccm-service start; then
    echo 'Failed to start services' >&2
    ccm-service stop >/dev/null 2>&1
    exit 1
fi

if test $# -eq 0; then
    bash
    rc=$?
else
    bash -c "$*"
    rc=$?
fi

ccm-service stop
exit $rc
