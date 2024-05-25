SELECT
	peer.id as id,
	peer.name as name,
	peer.description as description,
	peer.interfaceName as interfaceName,
	peer.listenPort as listenPort,
	peer.fwMark as fwMark,
	formatBase64 (peer.publicKey) as publicKey,
	(peer.privateKey NOTNULL) as hasPrivateKey,
	json_group_array(DISTINCT tag.tag) FILTER (
		WHERE
			tag.tag NOTNULL
	) as tags,
	json_group_array(
		DISTINCT json_object(
			'ip',
			formatIP (ip.ip),
			'netmask',
			ip.netmask,
			'peerCondition',
			ip.peerCondition
		)
	) FILTER (
		WHERE
			ip.ip NOTNULL
	) as addresses,
	json_group_array(
		DISTINCT json_object(
			'endpoint',
			endpoint.endpoint,
			'priority',
			endpoint.priority,
			'peerCondition',
			endpoint.peerCondition
		)
	) FILTER (
		WHERE
			endpoint.endpoint NOTNULL
	) as endpoints,
	json_group_array(
		DISTINCT json_object(
			'ip',
			formatIP (allowedIp.ip),
			'netmask',
			allowedIp.netmask,
			'peerCondition',
			allowedIp.peerCondition
		)
	) FILTER (
		WHERE
			allowedIp.ip NOTNULL
	) as allowedIps
FROM
	peers as peer
	LEFT JOIN peerTags as tag ON peer.id = tag.peer
	LEFT JOIN peerIps as ip ON peer.id = ip.peer
	LEFT JOIN peerEndpoints as endpoint ON peer.id = endpoint.peer
	LEFT JOIN peerAllowedIps as allowedIp ON peer.id = allowedIp.peer
GROUP BY
	peer.id
