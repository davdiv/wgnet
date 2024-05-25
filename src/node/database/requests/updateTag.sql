UPDATE tags
SET
	name = @name,
	description = @description,
	color = @color
WHERE
	id = @id
