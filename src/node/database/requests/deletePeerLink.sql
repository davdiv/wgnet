DELETE FROM peerLinks
WHERE
	peer1 = @peer1
	AND peer2 = @peer2
	AND peer1 IN (
		SELECT
			id
		FROM
			peers
		WHERE
			id = @peer1
			AND matchPeerCondition (@requestPeerCondition, tags, id)
	)
	AND peer2 IN (
		SELECT
			id
		FROM
			peers
		WHERE
			id = @peer2
			AND matchPeerCondition (@requestPeerCondition, tags, id)
	)
