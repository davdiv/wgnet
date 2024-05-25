SELECT
	peer1,
	peer2,
	(presharedKey NOTNULL) as hasPSK
FROM
	peerLinks
