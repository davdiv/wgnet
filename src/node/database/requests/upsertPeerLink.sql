INSERT INTO
	peerLinks (peer1, peer2, presharedKey)
SELECT
	@peer1,
	@peer2,
	cipher (parse32BytesBase64 (@presharedKey))
FROM
	peers as peer1Info
	INNER JOIN peers as peer2Info
WHERE
	peer1Info.id = @peer1
	AND peer2Info.id = @peer2
	AND matchPeerCondition (@requestPeerCondition, peer1Info.tags, @peer1)
	AND matchPeerCondition (@requestPeerCondition, peer2Info.tags, @peer2)
ON CONFLICT (peer1, peer2) DO UPDATE
SET
	presharedKey = excluded.presharedKey
