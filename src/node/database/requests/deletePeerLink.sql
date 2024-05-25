DELETE FROM peerLinks
WHERE
	peer1 = @peer1
	AND peer2 = @peer2
