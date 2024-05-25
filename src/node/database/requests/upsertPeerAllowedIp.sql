INSERT INTO
	peerAllowedIps (peer, ip, netmask, peerCondition)
VALUES
	(@peer, parseIP (@ip), @netmask, @peerCondition)
ON CONFLICT (peer, ip, netmask) DO
UPDATE
SET
	peerCondition = excluded.peerCondition
