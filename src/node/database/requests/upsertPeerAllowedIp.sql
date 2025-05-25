INSERT INTO
	peerAllowedIps (peer, ip, netmask, peerCondition)
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
ON CONFLICT (peer, ip, netmask) DO UPDATE
SET
	peerCondition = excluded.peerCondition
