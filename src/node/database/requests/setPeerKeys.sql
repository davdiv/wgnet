UPDATE peers
SET
	privateKey = cipher (parse32BytesBase64 (@privateKey)),
	publicKey = parse32BytesBase64 (@publicKey)
WHERE
	id = @id
