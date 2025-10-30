import ScreenHeaders from "@/components/ScreenHeaders";
import { isUserCancelledError } from "@/src/utils/iapErrors";
import Constants from "expo-constants";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

type UseIAPHook = typeof import("react-native-iap")["useIAP"];
type ErrorCodeMap = typeof import("react-native-iap")["ErrorCode"];

let useIAPImpl: UseIAPHook | undefined;
let errorCodeMapImpl: ErrorCodeMap | undefined;

if (Constants.appOwnership !== "expo") {
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const iap = require("react-native-iap");
		useIAPImpl = iap.useIAP;
		errorCodeMapImpl = iap.ErrorCode;
	} catch (error) {
		if (__DEV__) {
			console.warn(
				"[IapBarebone] react-native-iap is unavailable. Showing fallback screen.",
				error
			);
		}
	}
}

const productIds = ["fullAccess100"];

const IapBareboneContent: React.FC<{
	useIAPHook: UseIAPHook;
	errorCodeMap: ErrorCodeMap;
}> = ({ useIAPHook, errorCodeMap }) => {
	const handlePurchaseError = React.useCallback(
		(error: any) => {
			if (isUserCancelledError(error)) {
				return;
			}

			switch (error.code) {
				case errorCodeMap.BillingUnavailable:
					Alert.alert(
						"Purchases Unavailable",
						"Purchases are not allowed on this device"
					);
					break;
				case errorCodeMap.ItemUnavailable:
					Alert.alert("Product Unavailable", "This product is not available");
					break;
				case errorCodeMap.NetworkError:
					Alert.alert(
						"Network Error",
						"Please check your connection and try again"
					);
					break;
				case errorCodeMap.PurchaseError:
					Alert.alert("Purchase Error", "Invalid payment information");
					break;
				default:
					Alert.alert(
						"Purchase Failed",
						error?.message || "An unknown error occurred"
					);
			}
		},
		[errorCodeMap]
	);

	const {
		connected,
		products,
		fetchProducts,
		requestPurchase,
		validateReceipt,
	} = useIAPHook({
		onPurchaseSuccess: (purchase) => {
			console.log("Purchase successful:", purchase);
			validatePurchase(purchase);
		},
		onPurchaseError: (error) => {
			console.error("Purchase failed:", error);
			handlePurchaseError(error);
		},
	});

	const validatePurchase = React.useCallback(
		async (purchase: any) => {
			try {
				const result = await validateReceipt(purchase.productId);

				console.log("Receipt validation result:", {
					isValid: result.isValid,
					receiptData: result.receiptData,
					jwsRepresentation: result.jwsRepresentation,
				});

				if (result.isValid) {
					Alert.alert("Success", "Purchase completed successfully!");
					return true;
				} else {
					console.warn("Receipt validation failed - invalid receipt");
					Alert.alert("Validation Failed", "Unable to validate your purchase");
					return false;
				}
			} catch (error) {
				console.error("Receipt validation failed:", error);
				Alert.alert(
					"Validation Error",
					"Failed to validate receipt. Please contact support."
				);
				return false;
			}
		},
		[validateReceipt]
	);

	React.useEffect(() => {
		if (connected) {
			fetchProducts({ skus: productIds, type: "in-app" });
		}
	}, [connected, fetchProducts]);

	return (
		<View>
			<ScreenHeaders content='IAP Barebones' />
			{products.map((product) => (
				<TouchableOpacity
					key={product.id}
					onPress={() =>
						requestPurchase({
							request: { ios: { sku: product.id } },
							type: "in-app",
						})
					}>
					<Text>
						{product.title} - {product.displayPrice}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
};

const ExpoGoFallback = () => (
	<View>
		<ScreenHeaders content='IAP Barebones' />
		<Text style={{ padding: 16, textAlign: "center" }}>
			In-app purchases aren't available in Expo Go. Build a development client
			or use the mock subscription screen to test the UI.
		</Text>
	</View>
);

function App() {
	if (!useIAPImpl || !errorCodeMapImpl) {
		return <ExpoGoFallback />;
	}

	return <IapBareboneContent useIAPHook={useIAPImpl} errorCodeMap={errorCodeMapImpl} />;
}

export default App;
