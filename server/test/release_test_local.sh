#!/bin/bash
CONFIG_DIR=/tmp/WHEEL_CONFIG_DIR
TAG_TEST_SERVER=wheel_release_test_server

mkdir ${CONFIG_DIR} 2>/dev/null
./prepare_remotehost_container.sh ${CONFIG_DIR} ${TAG_TEST_SERVER}

WHEEL_CONFIG_DIR=/tmp/WHEEL_CONFIG_DIR WHEEL_TEST_REMOTEHOST=testServer WHEEL_TEST_REMOTE_PASSWORD=passw0rd npm run test
docker stop ${TAG_TEST_SERVER}
