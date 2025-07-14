#!/bin/bash

echo '{}' > ./config.json
chmod ugo=rw ./config.json
podman run --rm -p 8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin -v ./config.json:/config.json:rw -v ./profile.json:/profile.json:ro -v ./healthcheck.sh:/healthcheck.sh:ro -v ./entrypoint.sh:/entrypoint.sh:ro --entrypoint /entrypoint.sh quay.io/keycloak/keycloak:26.3.1 start-dev --health-enabled=true 2>&1 | tee keycloak.log
