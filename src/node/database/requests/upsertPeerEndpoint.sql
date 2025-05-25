INSERT INTO
	peerEndpoints (peer, endpoint, priority, peerCondition)
SELECT
	@peer,
	@endpoint,
	@priority,
	@peerCondition
FROM
	peers
WHERE
	id = @peer
	AND matchPeerCondition (@requestPeerCondition, tags, @peer)
ON CONFLICT (peer, endpoint) DO UPDATE
SET
	priority = excluded.priority,
	peerCondition = excluded.peerCondition
