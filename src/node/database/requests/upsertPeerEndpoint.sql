INSERT INTO
	peerEndpoints (peer, endpoint, priority, peerCondition)
VALUES
	(@peer, @endpoint, @priority, @peerCondition)
ON CONFLICT (peer, endpoint) DO
UPDATE
SET
	priority = excluded.priority,
	peerCondition = excluded.peerCondition
