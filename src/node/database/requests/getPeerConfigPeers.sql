SELECT
	formatBase64 (peer.publicKey) as publicKey,
	formatBase64 (decipher (link.presharedKey)) as presharedKey,
	aggregateIPCIDR (
		peerAllowedIps.ip,
		peerAllowedIps.netmask,
		peerIps.ip
	) as allowedIPs,
	aggregateKeepTopPriority (peerEndpoints.endpoint, peerEndpoints.priority) as endpoint
FROM
	peers as peer
	INNER JOIN peerLinks as link ON (
		link.peer1 = @id
		AND link.peer2 = peer.id
	)
	OR (
		link.peer2 = @id
		AND link.peer1 = peer.id
	)
	LEFT JOIN peerIps ON (
		peerIps.peer = peer.id
		AND matchPeerCondition (peerIps.peerCondition, @peerTags)
	)
	LEFT JOIN peerAllowedIps ON (
		peerAllowedIps.peer = peer.id
		AND matchPeerCondition (peerAllowedIps.peerCondition, @peerTags)
	)
	LEFT JOIN peerEndpoints ON (
		peerEndpoints.peer = peer.id
		AND matchPeerCondition (peerEndpoints.peerCondition, @peerTags)
	)
WHERE
	peer.publicKey NOTNULL
GROUP BY
	peer.id
