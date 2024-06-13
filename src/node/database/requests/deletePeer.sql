DELETE FROM peers
WHERE
	id = @id
	AND matchPeerCondition (@requestPeerCondition, tags, id)
