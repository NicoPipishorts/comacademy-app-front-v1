import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useIAP } from "react-native-iap";

const productIds = ["fullAccess100"];

function App() {
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
			// Handle purchase error
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
			if (result.isValid) {
				// Grant user the purchased content
				console.log("Receipt is valid");
			}
		} catch (error) {
			console.error("Validation failed:", error);
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
					<Text>
						{product.title} - {product.displayPrice}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}

export default App;
