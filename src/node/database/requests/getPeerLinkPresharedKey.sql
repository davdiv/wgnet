SELECT
	formatBase64 (decipher (presharedKey)) as presharedKey
FROM
	peerLinks
WHERE
	peer1 = @peer1
	AND peer2 = @peer2
