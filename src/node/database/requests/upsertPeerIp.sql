INSERT INTO
	peerIps (peer, ip, netmask, peerCondition)
SELECT
	@peer,
	parseIP (@ip),
	@netmask,
	@peerCondition
FROM
	peers
WHERE
	id = @peer
	AND matchPeerCondition (@requestPeerCondition, tags, @peer)
ON CONFLICT (peer, ip) DO
UPDATE
SET
	netmask = excluded.netmask,
	peerCondition = excluded.peerCondition
