import ScreenHeaders from "@/components/ScreenHeaders";
import React, { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import * as RNIap from "react-native-iap";

const IOS_PRODUCT_IDS = ["fullAccess100", "fullAccess1200"];

export default function IapRawDebug() {
	const [keys, setKeys] = useState<string[]>([]);
	const [error, setError] = useState<any>(null);
	const [products, setProducts] = useState<any[]>([]);
	const [log, setLog] = useState<string[]>([]);

	const pushLog = (msg: string, data?: any) => {
		const line =
			data === undefined ? msg : `${msg} ${JSON.stringify(data, null, 2)}`;
		setLog((prev) => [...prev, line]);
	};

	useEffect(() => {
		(async () => {
			try {
				const k = Object.keys(RNIap);
				setKeys(k);
				pushLog("RNIap keys:", k);

				pushLog("Calling initConnection()");
				await RNIap.initConnection();
				pushLog("initConnection OK");

				// 👇 Try both signatures, one at a time if needed
				pushLog("Calling getSubscriptions([...]) with", IOS_PRODUCT_IDS);
				const subs = await (RNIap as any).getSubscriptions(IOS_PRODUCT_IDS);
				// If this throws, comment it out and try the object form:
				// const subs = await (RNIap as any).getSubscriptions({
				//   skus: IOS_PRODUCT_IDS,
				// });

				pushLog("getSubscriptions result:", subs);
				setProducts(subs);
			} catch (e: any) {
				pushLog("RAW IAP ERROR", { message: e?.message, raw: String(e) });
				setError({ message: e?.message, raw: String(e) });
			}
		})();
	}, []);

	return (
		<ScrollView style={{ flex: 1, padding: 16 }}>
			<ScreenHeaders content='IAP RAW DEBUG' />

			<Text style={{ fontWeight: "600", marginBottom: 8 }}>Module keys:</Text>
			<Text style={{ fontSize: 12, marginBottom: 12 }}>
				{JSON.stringify(keys, null, 2)}
			</Text>

			<Text style={{ fontWeight: "600", marginBottom: 8 }}>Error:</Text>
			<Text style={{ fontSize: 12, marginBottom: 12 }}>
				{JSON.stringify(error, null, 2)}
			</Text>

			<Text style={{ fontWeight: "600", marginBottom: 8 }}>Products:</Text>
			<Text style={{ fontSize: 12, marginBottom: 12 }}>
				{JSON.stringify(products, null, 2)}
			</Text>

			<Text style={{ fontWeight: "600", marginBottom: 8 }}>Logs:</Text>
			{log.map((l, i) => (
				<Text key={i} style={{ fontSize: 12, marginBottom: 4 }}>
					{l}
				</Text>
			))}
		</ScrollView>
	);
}
