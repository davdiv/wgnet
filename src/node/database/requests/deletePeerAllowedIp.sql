DELETE FROM peerAllowedIps
WHERE
	peer = @peer
	AND ip = parseIP (@ip)
	AND netmask = @netmask
	AND peer IN (
		SELECT
			id
		FROM
			peers
		WHERE
			id = @peer
			AND matchPeerCondition (@requestPeerCondition, tags, id)
	)
