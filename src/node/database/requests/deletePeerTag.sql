DELETE FROM peerTags
WHERE
	peer = @peer
	AND tag = @tag
