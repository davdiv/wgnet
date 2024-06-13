import type { PeerInfo } from "../../node/database/requests/getAllPeers";
import { ComposedConditionType, evaluateCondition, pcAnd, pcOr, type PeerCondition } from "./evaluate";
import { simplifyPeerCondition } from "./simplify";

export const enum PeerAccess {
	ReadOwnConfig = 1 << 0,
	ReadLink = 1 << 1,
	ReadPrivateKey = 1 << 2,
	ReadLinkKey = 1 << 3,
	ReadFullConfig = 1 << 4,
	WritePublicKey = 1 << 5,
	WritePrivateKey = 1 << 6,
	WriteOwnConfig = 1 << 7,
	WriteLink = 1 << 8,
	WriteTags = 1 << 9,
	CreateDelete = 1 << 10,
}

export const fullPeerReadAccess = PeerAccess.ReadOwnConfig | PeerAccess.ReadPrivateKey | PeerAccess.ReadLink | PeerAccess.ReadLinkKey | PeerAccess.ReadFullConfig;
export const fullPeerWriteAccess = fullPeerReadAccess | PeerAccess.WriteOwnConfig | PeerAccess.WritePrivateKey | PeerAccess.WritePublicKey | PeerAccess.WriteLink | PeerAccess.WriteTags;
export const fullPeerAdminAccess = fullPeerWriteAccess | PeerAccess.CreateDelete;

export type PeerAccessRight = [PeerAccess, PeerCondition];

export const reduceRights = (maxRights: number, accessRights?: PeerAccessRight[]): PeerAccessRight[] => (accessRights ?? []).map(([access, condition]) => [access & maxRights, condition]);

export const getPeerCondition = (requestedAccess: PeerAccess, accessRights?: PeerAccessRight[]) =>
	simplifyPeerCondition(pcOr(...(accessRights ?? []).filter(([access]) => (access & requestedAccess) === requestedAccess).map(([access, condition]) => condition)));

export const fullPeerAdminRights: PeerAccessRight = [fullPeerAdminAccess, pcAnd()];

export const hasPeerAccess = (peerInfo: Pick<PeerInfo, "id" | "tags">, requestedAccess: PeerAccess, accessRights?: PeerAccessRight[]) => {
	const peerCondition = getPeerCondition(requestedAccess, accessRights);
	return evaluateCondition(peerCondition, new Set(peerInfo.tags), peerInfo.id);
};

export const canHavePeerAccess = (requestedAccess: PeerAccess, accessRights?: PeerAccessRight[]) => {
	const peerCondition = getPeerCondition(requestedAccess, accessRights);
	return peerCondition.length > 1 || peerCondition[0] !== ComposedConditionType.Or;
};
