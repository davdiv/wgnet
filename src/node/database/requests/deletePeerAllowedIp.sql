DELETE FROM peerAllowedIps
WHERE
	peer = @peer
	AND ip = parseIP (@ip)
	AND netmask = @netmask
