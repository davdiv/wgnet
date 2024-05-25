INSERT INTO
	peerTags (peer, tag)
VALUES
	(@peer, @tag)
ON CONFLICT (peer, tag) DO NOTHING
