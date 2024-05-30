#!/bin/bash

(

set -e

while ! ./healthcheck.sh &> /dev/null ; do sleep 1; done
echo "Executing startup for wgnet"
/opt/keycloak/bin/kcadm.sh config credentials --server http://[::1]:8080/ --realm master --user "admin" --password "admin"
/opt/keycloak/bin/kcadm.sh create realms -s realm=wgnet -s enabled=true
CLIENT_ID=$(/opt/keycloak/bin/kcadm.sh create -r wgnet clients -s clientId=wgnet -s fullScopeAllowed=false -s 'baseUrl=http://[::1]:3000' -s 'redirectUris=["http://[::1]:3000/*","http://[::1]:5173/*"]' -i)
/opt/keycloak/bin/kcadm.sh create -r wgnet clients/$CLIENT_ID/protocol-mappers/models -s 'name=wgnet-audience' -s 'protocol=openid-connect' -s 'protocolMapper=oidc-audience-mapper' -s 'config."included.client.audience"=wgnet' -s 'config."access.token.claim"=true'
ADMIN_ID=$(/opt/keycloak/bin/kcadm.sh create -r wgnet users -s username="admin" -s enabled=true -i)
/opt/keycloak/bin/kcadm.sh set-password -r wgnet --username "admin" --new-password "admin"
echo "Created new client with id '$CLIENT_ID'"
/opt/keycloak/bin/kcadm.sh get -r wgnet clients/$CLIENT_ID/installation/providers/keycloak-oidc-keycloak-json > /config.json
echo "Startup for wgnet successfully executed!"

) &

exec /opt/keycloak/bin/kc.sh "$@"
