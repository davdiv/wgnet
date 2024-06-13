DELETE FROM peerEndpoints
WHERE
	peer = @peer
	AND endpoint = @endpoint
	AND peer IN (
		SELECT
			id
		FROM
			peers
		WHERE
			id = @peer
			AND matchPeerCondition (@requestPeerCondition, tags, id)
	)
