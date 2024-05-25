SELECT
	formatBase64 (decipher (privateKey)) as privateKey
FROM
	peers
WHERE
	id = @id
