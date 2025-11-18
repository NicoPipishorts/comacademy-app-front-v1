import ScreenHeaders from "@/components/ScreenHeaders";
import { useSubscription } from "@/src/hooks/useSubscription";
import { __iapLogs } from "@/src/utils/debug";
import React from "react";
import { Button, ScrollView, Text, View } from "react-native";

const IapBareboneScreen = () => {
	const { loading, error, products, subscription, refresh, purchase } =
		useSubscription();

	return (
		<ScrollView style={{ flex: 1, padding: 16 }}>
			<ScreenHeaders content='IAP Barebones' />

			<View style={{ marginBottom: 16 }}>
				<Text>loading: {String(loading)}</Text>
				<Text>error: {error ?? "none"}</Text>
				<Text>
					active subscription:{" "}
					{subscription ? JSON.stringify(subscription, null, 2) : "none"}
				</Text>
			</View>

			<View style={{ marginBottom: 16 }}>
				<Button title='Refresh products & subscription' onPress={refresh} />
			</View>

			<Text style={{ fontWeight: "600", marginBottom: 8 }}>Products:</Text>
			{products.length === 0 && (
				<Text>No products returned from the store.</Text>
			)}

			<Text>Logs:</Text>
			{__iapLogs.map((l, i) => (
				<Text key={i} style={{ fontSize: 12 }}>
					{l}
				</Text>
			))}

			{products.map((p, index) => (
				<View
					key={p.productId ?? `${p.title}-${index}`}
					style={{
						marginBottom: 12,
						padding: 12,
						borderWidth: 1,
						borderRadius: 8,
					}}>
					<Text style={{ fontWeight: "600" }}>{p.title}</Text>
					<Text>{p.description}</Text>
					<Text>
						Price:{" "}
						{"localizedPrice" in p && p.localizedPrice
							? p.localizedPrice
							: p.price}
					</Text>

					<View style={{ marginTop: 8 }}>
						<Button title='Purchase' onPress={() => purchase(p)} />
					</View>
				</View>
			))}
		</ScrollView>
	);
};

export default IapBareboneScreen;
