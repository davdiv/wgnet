UPDATE peers
SET
	name = @name,
	description = @description,
	interfaceName = @interfaceName,
	listenPort = @listenPort,
	fwMark = @fwMark
WHERE
	id = @id
