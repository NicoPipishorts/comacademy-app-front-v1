export type PurchaseValidationPayload =
	| {
			platform: "ios";
			productId?: string;
			environment: string;
			originalTransactionId?: string;
			transactionId?: string;
			signedTransactionInfo?: string;
			transactionReceipt?: string;
			appAccountToken?: string;
	  }
	| {
			platform: "android";
			productId?: string;
			environment: string;
			purchaseToken: string;
			orderId?: string;
			transactionId?: string;
	  };

export type PendingPurchaseMetadata = {
	platform: "ios" | "android";
	productId?: string;
	purchaseToken?: string;
	orderId?: string;
	transactionId?: string;
	originalTransactionId?: string;
};

export type PendingPurchase = {
	id: string;
	payload: PurchaseValidationPayload;
	metadata: PendingPurchaseMetadata;
	timestamp: number;
};
