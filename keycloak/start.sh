#!/bin/bash

echo '{}' > ./config.json
docker run --rm -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin -v ./config.json:/config.json -v ./healthcheck.sh:/healthcheck.sh -v ./entrypoint.sh:/entrypoint.sh --entrypoint /entrypoint.sh quay.io/keycloak/keycloak:24.0.5 start-dev --health-enabled=true 2>&1 | tee keycloak.log
