import { SlotDurationMs, slotsToMsNum } from '@velocity-exchange/sdk';

/**
 * Allowance on top of the placement window for the send + websocket confirmation
 * round trip. A wall-clock network budget, not a slot count.
 */
export const SWIFT_CONFIRMATION_ROUND_TRIP_MS = 6_000;

export function getSwiftConfirmationTimeoutMs(
	slotsTillPlacementDeadline: number,
	multiplier: number | undefined,
	slotDuration: SlotDurationMs
): number {
	const baseMs =
		slotsToMsNum(slotsTillPlacementDeadline, slotDuration) +
		SWIFT_CONFIRMATION_ROUND_TRIP_MS;
	return baseMs * (multiplier ?? 1);
}
