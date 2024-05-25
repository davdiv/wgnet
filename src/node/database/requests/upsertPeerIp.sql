INSERT INTO
	peerIps (peer, ip, netmask, peerCondition)
VALUES
	(@peer, parseIP (@ip), @netmask, @peerCondition)
ON CONFLICT (peer, ip) DO
UPDATE
SET
	netmask = excluded.netmask,
	peerCondition = excluded.peerCondition
