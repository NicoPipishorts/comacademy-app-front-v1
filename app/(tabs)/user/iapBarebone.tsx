import ScreenHeaders from "@/components/ScreenHeaders";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { ErrorCode, useIAP } from "react-native-iap";

const productIds = ["fullAccess100"];

function App() {
	const handlePurchaseError = (error: any) => {
		switch (error.code) {
			case ErrorCode.UserCancelled:
				// User cancelled - don't show error
				break;
			case ErrorCode.BillingUnavailable:
				Alert.alert("Purchases Unavailable", "Purchases are not allowed on this device");
				break;
			case ErrorCode.ItemUnavailable:
				Alert.alert("Product Unavailable", "This product is not available");
				break;
			case ErrorCode.NetworkError:
				Alert.alert("Network Error", "Please check your connection and try again");
				break;
			case ErrorCode.PurchaseError:
				Alert.alert("Purchase Error", "Invalid payment information");
				break;
			default:
				Alert.alert("Purchase Failed", error.message || "An unknown error occurred");
		}
	};

	const {
		connected,
		products,
		fetchProducts,
		requestPurchase,
		validateReceipt,
	} = useIAP({
		onPurchaseSuccess: (purchase) => {
			console.log("Purchase successful:", purchase);
			// Handle successful purchase
			validatePurchase(purchase);
		},
		onPurchaseError: (error) => {
			console.error("Purchase failed:", error);
			handlePurchaseError(error);
		},
	});

	React.useEffect(() => {
		if (connected) {
			fetchProducts({ skus: productIds, type: "in-app" });
		}
	}, [connected]);

	const validatePurchase = async (purchase: any) => {
		try {
			const result = await validateReceipt(purchase.productId);

			console.log("Receipt validation result:", {
				isValid: result.isValid,
				receiptData: result.receiptData,
				jwsRepresentation: result.jwsRepresentation, // iOS 15+
			});

			if (result.isValid) {
				// Grant user the purchased content
				console.log("Receipt is valid - granting access");
				Alert.alert("Success", "Purchase completed successfully!");
				return true;
			} else {
				console.warn("Receipt validation failed - invalid receipt");
				Alert.alert("Validation Failed", "Unable to validate your purchase");
				return false;
			}
		} catch (error) {
			console.error("Receipt validation failed:", error);
			Alert.alert("Validation Error", "Failed to validate receipt. Please contact support.");
			return false;
		}
	};

	return (
		<View>
			{products.map((product) => (
				<TouchableOpacity
					key={product.id}
					onPress={() =>
						requestPurchase({
							request: { ios: { sku: product.id } },
							type: "in-app",
						})
					}>
					<ScreenHeaders content='IAP Barebones' />
					<Text>
						{product.title} - {product.displayPrice}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}

export default App;
