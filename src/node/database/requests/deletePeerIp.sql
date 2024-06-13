DELETE FROM peerIps
WHERE
	peer = @peer
	AND ip = parseIP (@ip)
	AND peer IN (
		SELECT
			id
		FROM
			peers
		WHERE
			id = @peer
			AND matchPeerCondition (@requestPeerCondition, tags, id)
	)
