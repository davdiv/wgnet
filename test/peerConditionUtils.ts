import type { PeerCondition } from "../src/common/peerConditions/evaluate";
import { ComposedConditionType, SimpleConditionType } from "../src/common/peerConditions/evaluate";

export const pcPeerId = (peerId: number): PeerCondition => [SimpleConditionType.PeerId, peerId];
export const pcTag = (tag: number): PeerCondition => [SimpleConditionType.Tag, tag];
export const pcAnd = (...peerConditions: PeerCondition[]): PeerCondition => [ComposedConditionType.And, ...peerConditions];
export const pcOr = (...peerConditions: PeerCondition[]): PeerCondition => [ComposedConditionType.Or, ...peerConditions];
export const pcNot = (peerCondition: PeerCondition): PeerCondition => [ComposedConditionType.Not, peerCondition];
