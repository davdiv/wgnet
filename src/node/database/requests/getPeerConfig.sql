SELECT
	peer.interfaceName as interfaceName,
	peer.listenPort as listenPort,
	peer.fwMark as fwMark,
	formatBase64 (decipher (peer.privateKey)) as privateKey,
	json_group_array(DISTINCT formatIPCIDR (ip.ip, ip.netmask)) FILTER (
		WHERE
			ip.ip NOTNULL
	) as address,
	json_group_array(DISTINCT tag.tag) FILTER (
		WHERE
			tag.tag NOTNULL
	) as tags
FROM
	peers as peer
	LEFT JOIN peerIps as ip ON peer.id = ip.peer
	LEFT JOIN peerTags as tag ON peer.id = tag.peer
WHERE
	peer.id = ?
GROUP BY
	peer.id
