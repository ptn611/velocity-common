import {
	BN,
	VelocityClient,
	OrderTriggerCondition,
	PositionDirection,
	SlotDurationMs,
	User,
} from '@velocity-exchange/sdk';
import {
	PublicKey,
	Transaction,
	TransactionInstruction,
	VersionedTransaction,
} from '@solana/web3.js';
import invariant from 'tiny-invariant';
import { WithTxnParams } from '../../types';

/**
 * Parameters for editing an existing order
 */
interface EditOrderParams {
	/** New direction for the order (long/short) */
	newDirection?: PositionDirection;
	/** New base amount for the order */
	newBaseAmount?: BN;
	/** New limit price for the order */
	newLimitPrice?: BN;
	/** New oracle price offset for oracle limit orders, PRICE_PRECISION (1e6), signed */
	newOraclePriceOffset?: BN;
	/** New trigger price for conditional orders */
	newTriggerPrice?: BN;
	/** New trigger condition for conditional orders */
	newTriggerCondition?: OrderTriggerCondition;
	/** Whether the order should only reduce position size */
	reduceOnly?: boolean;
	/** Whether the order should only be posted (maker only) */
	postOnly?: boolean;
	/** Bit flags for additional order configuration */
	bitFlags?: number;
	/** Maximum timestamp for order validity */
	maxTs?: BN;
	/** Order policy configuration */
	policy?: number;
	/** The leverage to be used for this position. */
	positionMaxLeverage?: number;
}

export interface CreateEditOrderIxParams {
	velocityClient: VelocityClient;
	user: User;
	orderId: number;
	editOrderParams: EditOrderParams;
	/** Live slot duration, resolved by the caller from `State` */
	slotDuration: SlotDurationMs;
	mainSignerOverride?: PublicKey;
}

/**
 * Creates a transaction instruction to edit an existing order
 * @param velocityClient - The VelocityClient instance
 * @param userPublicKey - The public key of the user who owns the order
 * @param orderId - The ID of the order to edit
 * @param editOrderParams - Parameters containing the new order values
 * @returns Promise that resolves to a TransactionInstruction
 */
export const createEditOrderIx = async (
	params: CreateEditOrderIxParams
): Promise<TransactionInstruction> => {
	const { velocityClient, user, orderId, editOrderParams, mainSignerOverride } =
		params;
	// TODO(propamm-ws-B): a book order has no slot, so it modifies through modifyOrderV1.
	invariant(user.getOrder(orderId), 'Current order not found');

	return velocityClient.getModifyOrderIx(
		{
			orderId,
			...editOrderParams,
		},
		undefined,
		{
			user,
			authority: mainSignerOverride,
		}
	);
};

type CreateEditOrderTxnParams = WithTxnParams<CreateEditOrderIxParams>;

/**
 * Creates a complete transaction to edit an existing order
 * @param velocityClient - The VelocityClient instance
 * @param userPublicKey - The public key of the user who owns the order
 * @param orderId - The ID of the order to edit
 * @param editOrderParams - Parameters containing the new order values
 * @param txParams - Optional transaction parameters (compute units, priority fees, etc.)
 * @returns Promise that resolves to a Transaction or VersionedTransaction
 */
export const createEditOrderTxn = async ({
	txParams,
	...params
}: CreateEditOrderTxnParams): Promise<Transaction | VersionedTransaction> => {
	return params.velocityClient.buildTransaction(
		await createEditOrderIx(params),
		txParams
	);
};
