INSERT INTO
	peers (
		name,
		description,
		interfaceName,
		listenPort,
		fwMark,
		publicKey,
		privateKey
	)
VALUES
	(
		@name,
		@description,
		@interfaceName,
		@listenPort,
		@fwMark,
		parse32BytesBase64 (@publicKey),
		cipher (parse32BytesBase64 (@privateKey))
	)
