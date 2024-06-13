SELECT
	formatBase64 (decipher (presharedKey)) as presharedKey
FROM
	peerLinks
	INNER JOIN peers as peer1Info ON peer1Info.id = peer1
	INNER JOIN peers as peer2Info ON peer2Info.id = peer2
WHERE
	peer1 = @peer1
	AND peer2 = @peer2
	AND matchPeerCondition (@requestPeerCondition, peer1Info.tags, peer1)
	AND matchPeerCondition (@requestPeerCondition, peer2Info.tags, peer2)
