INSERT INTO
	peers (
		name,
		description,
		tags,
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
		@tags,
		@interfaceName,
		@listenPort,
		@fwMark,
		parse32BytesBase64 (@publicKey),
		cipher (parse32BytesBase64 (@privateKey))
	)
