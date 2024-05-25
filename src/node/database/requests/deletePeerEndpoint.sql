DELETE FROM peerEndpoints
WHERE
	peer = @peer
	AND endpoint = @endpoint
