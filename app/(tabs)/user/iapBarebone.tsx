import ScreenHeaders from "@/components/ScreenHeaders";
import { useSubscription } from "@/src/hooks/useSubscription";
import { __iapLogs } from "@/src/utils/debug";
import React from "react";
import { Alert, Button, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";

const FORCED_EURO_PLAN_DISPLAY: Record<
	string,
	{ title: string; price: string; duration: string }
> = {
	fullAccess100: { title: "Premium mensuel", price: "5,99 €", duration: "/ mois" },
	fullAccess1200: { title: "Premium annuel", price: "49,99 €", duration: "/ an" },
};

const resolveDebugPlanDisplay = (product: any) => {
	const productId =
		(typeof product?.productId === "string" && product.productId) ||
		(typeof product?.id === "string" && product.id) ||
		"";
	const forced = FORCED_EURO_PLAN_DISPLAY[productId];
	if (forced) {
		return {
			productId,
			title: forced.title,
			price: `${forced.price} ${forced.duration}`.trim(),
		};
	}

	return {
		productId,
		title: product?.title ?? "Unknown",
		price: product?.localizedPrice || product?.price || "N/A",
	};
};

const IapBareboneScreen = () => {
	const { loading, error, products, subscription, refresh, purchase } =
		useSubscription();

	const copyLogsToClipboard = async () => {
		const statusInfo = [
			"=== IAP BAREBONES DEBUG INFO ===",
			`Loading: ${loading}`,
			`Error: ${error ?? "none"}`,
			`Products Count: ${products.length}`,
			`Active Subscription: ${subscription ? JSON.stringify(subscription, null, 2) : "none"}`,
			"",
			"=== DEBUG LOGS ===",
			...__iapLogs,
			"",
			"=== PRODUCTS ===",
			products.length === 0
				? "No products returned"
				: products
						.map((p, i) => {
							const display = resolveDebugPlanDisplay(p);
							return `Product ${i + 1}: ${display.productId} - ${display.title} - ${display.price}`;
						})
						.join("\n"),
		].join("\n");

		try {
			await Clipboard.setStringAsync(statusInfo);
			Alert.alert("Copied!", "Debug info copied to clipboard");
		} catch {
			Alert.alert("Error", "Failed to copy to clipboard");
		}
	};

	return (
		<ScrollView style={{ flex: 1, padding: 16 }}>
			<ScreenHeaders content='IAP Barebones' />

			<View style={{ marginBottom: 16 }}>
				<Text style={{ fontWeight: "600" }}>Status:</Text>
				<Text>loading: {String(loading)}</Text>
				<Text style={{ color: error ? "red" : "black" }}>
					error: {error ?? "none"}
				</Text>
				<Text>products count: {products.length}</Text>
				<Text>
					active subscription:{" "}
					{subscription ? JSON.stringify(subscription, null, 2) : "none"}
				</Text>
			</View>

			<View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
				<View style={{ flex: 1 }}>
					<Button title='Refresh' onPress={refresh} />
				</View>
				<View style={{ flex: 1 }}>
					<Button title='Copy All Logs' onPress={copyLogsToClipboard} color='#007AFF' />
				</View>
			</View>

			<Text style={{ fontWeight: "600", marginBottom: 8, fontSize: 16 }}>
				Debug Logs ({__iapLogs.length}):
			</Text>
			<View style={{ marginBottom: 16, padding: 8, backgroundColor: "#f5f5f5" }}>
				{__iapLogs.length === 0 ? (
					<Text style={{ fontSize: 12, fontStyle: "italic" }}>
						No logs yet - check console for errors
					</Text>
				) : (
					__iapLogs.map((l, i) => (
						<Text key={i} style={{ fontSize: 11, marginBottom: 4 }}>
							{l}
						</Text>
					))
				)}
			</View>

			<Text style={{ fontWeight: "600", marginBottom: 8, fontSize: 16 }}>
				Products ({products.length}):
			</Text>
			{products.length === 0 && (
				<Text style={{ marginBottom: 16, fontStyle: "italic" }}>
					⚠️ No products returned from the store. Check logs above for details.
				</Text>
			)}

			{products.map((p, index) => (
				(() => {
					const display = resolveDebugPlanDisplay(p);
					return (
				<View
					key={p.productId ?? `${p.title}-${index}`}
					style={{
						marginBottom: 12,
						padding: 12,
						borderWidth: 1,
						borderRadius: 8,
					}}>
					<Text style={{ fontWeight: "600" }}>{display.title}</Text>
					<Text>{p.description}</Text>
					<Text>Product ID: {display.productId || "N/A"}</Text>
					<Text>Price: {display.price}</Text>

					<View style={{ marginTop: 8 }}>
						<Button title='Purchase' onPress={() => purchase(p)} />
					</View>
				</View>
					);
				})()
			))}
		</ScrollView>
	);
};

export default IapBareboneScreen;
