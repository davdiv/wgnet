DELETE FROM peerIps
WHERE
	peer = @peer
	AND ip = parseIP (@ip)
