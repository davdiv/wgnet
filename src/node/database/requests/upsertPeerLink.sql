INSERT INTO
	peerLinks (peer1, peer2, presharedKey)
VALUES
	(
		@peer1,
		@peer2,
		cipher (parse32BytesBase64 (@presharedKey))
	)
ON CONFLICT (peer1, peer2) DO
UPDATE
SET
	presharedKey = excluded.presharedKey
