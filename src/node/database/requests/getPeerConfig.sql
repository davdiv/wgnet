SELECT
	peer.name as name,
	peer.interfaceName as interfaceName,
	peer.listenPort as listenPort,
	peer.fwMark as fwMark,
	iif(
		@withSecrets,
		formatBase64 (decipher (peer.privateKey))
	) as privateKey,
	json_group_array(DISTINCT formatIPCIDR (ip.ip, ip.netmask)) FILTER (
		WHERE
			ip.ip NOTNULL
	) as address,
	coalesce(peer.tags, '[]') as tags
FROM
	peers as peer
	LEFT JOIN peerIps as ip ON peer.id = ip.peer
WHERE
	peer.id = @id
GROUP BY
	peer.id
HAVING
	matchPeerCondition (@requestPeerCondition, tags, @id)
