#!/bin/bash

(

set -e

while ! ./healthcheck.sh &> /dev/null ; do sleep 1; done
echo "Executing startup for wgnet"
/opt/keycloak/bin/kcadm.sh config credentials --server http://[::1]:8080/ --realm master --user "admin" --password "admin"
/opt/keycloak/bin/kcadm.sh create realms -s realm=wgnet -s enabled=true
CLIENT_ID=$(/opt/keycloak/bin/kcadm.sh create -r wgnet clients -s clientId=wgnet -s fullScopeAllowed=false -s 'baseUrl=http://[::1]:3000' -s 'redirectUris=["http://[::1]:3000/*","http://[::1]:5173/*"]' -i)
/opt/keycloak/bin/kcadm.sh create -r wgnet clients/$CLIENT_ID/roles -s name=tags-admin -s 'description=Can fully manage tags'
/opt/keycloak/bin/kcadm.sh create -r wgnet clients/$CLIENT_ID/protocol-mappers/models -s 'name=wgnet-audience' -s 'protocol=openid-connect' -s 'protocolMapper=oidc-audience-mapper' -s 'config."included.client.audience"=wgnet' -s 'config."access.token.claim"=true'
# FIXME: the following mapping is not really correct, it will behave incorrectly if other roles are added. It looks like keycloak currently does not seem to support passing roles as booleans!
/opt/keycloak/bin/kcadm.sh create -r wgnet clients/$CLIENT_ID/protocol-mappers/models -s 'name=wgnet-peer-tag-admin' -s 'protocol=openid-connect' -s 'protocolMapper=oidc-usermodel-client-role-mapper' -s 'config."claim.name"=wgnet.tagsAdmin' -s 'config."multivalued"=true' -s 'config."jsonType.label"=String' -s 'config."usermodel.clientRoleMapping.clientId"=wgnet' -s 'config."access.token.claim"=true'
/opt/keycloak/bin/kcadm.sh create -r wgnet clients/$CLIENT_ID/protocol-mappers/models -s 'name=wgnet-peer-access-rights' -s 'protocol=openid-connect' -s 'protocolMapper=oidc-usermodel-attribute-mapper' -s 'config."user.attribute"=wgnetPeerAccessRights' -s 'config."claim.name"=wgnet.peerAccess' -s 'config."jsonType.label"=JSON' -s 'config."access.token.claim"=true'
/opt/keycloak/bin/kcadm.sh create -r wgnet clients/$CLIENT_ID/protocol-mappers/models -s 'name=wgnet-peer-default-tags' -s 'protocol=openid-connect' -s 'protocolMapper=oidc-usermodel-attribute-mapper' -s 'config."user.attribute"=wgnetPeerDefaultTags' -s 'config."claim.name"=wgnet.peerDefaultTags' -s 'config."jsonType.label"=JSON' -s 'config."access.token.claim"=true'
/opt/keycloak/bin/kcadm.sh update -f /profile.json realms/wgnet/users/profile
ADMIN_ID=$(/opt/keycloak/bin/kcadm.sh create -r wgnet users -s username="admin" -s enabled=true -s "attributes.wgnetPeerAccessRights='[[2047,[\"a\"]]]'" -i)
/opt/keycloak/bin/kcadm.sh add-roles -r wgnet --uusername admin --cclientid wgnet --rolename tags-admin
/opt/keycloak/bin/kcadm.sh set-password -r wgnet --username "admin" --new-password "admin"
SPY_ID=$(/opt/keycloak/bin/kcadm.sh create -r wgnet users -s username="spy" -s enabled=true -s "attributes.wgnetPeerAccessRights='[[31,[\"a\"]]]'" -i)
/opt/keycloak/bin/kcadm.sh set-password -r wgnet --username "spy" --new-password "spy"
VIEWER_ID=$(/opt/keycloak/bin/kcadm.sh create -r wgnet users -s username="viewer" -s enabled=true -s "attributes.wgnetPeerAccessRights='[[3,[\"a\"]]]'" -i)
/opt/keycloak/bin/kcadm.sh set-password -r wgnet --username "viewer" --new-password "viewer"
echo "Created new client with id '$CLIENT_ID'"
/opt/keycloak/bin/kcadm.sh get -r wgnet clients/$CLIENT_ID/installation/providers/keycloak-oidc-keycloak-json > /config.json
echo "Startup for wgnet successfully executed!"

) &

exec /opt/keycloak/bin/kc.sh "$@"
