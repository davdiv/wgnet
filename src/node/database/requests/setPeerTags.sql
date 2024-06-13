UPDATE peers
SET
	tags = @tags
WHERE
	id = @id
	AND matchPeerCondition (@requestPeerCondition, @tags, id)
	AND matchPeerCondition (@requestPeerCondition, tags, id)
