import ScreenHeaders from "@/components/ScreenHeaders";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";

const IOS_PRODUCT_IDS = ["fullAccess100", "fullAccess1200"];
const isExpoGo = Constants.appOwnership === "expo";

export default function IapRawDebug() {
	const [keys, setKeys] = useState<string[]>([]);
	const [error, setError] = useState<any>(null);
	const [products, setProducts] = useState<any[]>([]);
	const [log, setLog] = useState<string[]>([]);
	const mockMode = isExpoGo;
	const mockInitRef = useRef(false);

	const pushLog = useCallback((msg: string, data?: any) => {
		const line =
			data === undefined ? msg : `${msg} ${JSON.stringify(data, null, 2)}`;
		setLog((prev) => [...prev, line]);
	}, []);

	useEffect(() => {
		let cancelled = false;

		const logSafe = (msg: string, data?: any) => {
			if (!cancelled) {
				pushLog(msg, data);
			}
		};

		const setSafe = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => {
			return (value: React.SetStateAction<T>) => {
				if (!cancelled) {
					setter(value);
				}
			};
		};

		const setKeysSafe = setSafe(setKeys);
		const setProductsSafe = setSafe(setProducts);
		const setErrorSafe = setSafe(setError);

		if (!mockMode) {
			mockInitRef.current = false;
		}

		if (mockMode) {
			if (!mockInitRef.current) {
				logSafe(
					"Expo Go detected – skipping react-native-iap import. Install a dev build to inspect the native module."
				);
				setErrorSafe((prev) => {
					if (prev) return prev;
					return {
						message: "react-native-iap indisponible dans Expo Go",
						raw: "Mock mode active – native module disabled.",
					};
				});
				mockInitRef.current = true;
			}
			return () => {
				cancelled = true;
			};
		}

		(async () => {
			try {
				logSafe("Importing react-native-iap module…");
				const imported = await import("react-native-iap");
				if (cancelled) return;
				const RNIap = (imported as any).default ?? imported;

				// Inspect the module
				const k = Object.keys(RNIap as any);
				setKeysSafe(k);
				logSafe("RNIap keys:", k);

				// Init connection
				logSafe("Calling initConnection()");
				await (RNIap as any).initConnection();
				logSafe("initConnection OK");

				// ✅ v14 API: fetchProducts
				logSafe(
					"Calling fetchProducts({ skus, type: 'subs' }) with",
					IOS_PRODUCT_IDS
				);
				const fetched = await (RNIap as any).fetchProducts({
					skus: IOS_PRODUCT_IDS,
					type: "subs",
				});

				logSafe("fetchProducts result:", fetched);
				setProductsSafe(fetched ?? []);
			} catch (e: any) {
				if (cancelled) return;
				logSafe("RAW IAP ERROR", { message: e?.message, raw: String(e) });
				setErrorSafe({ message: e?.message, raw: String(e) });
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [mockMode, pushLog]);

	return (
		<ScrollView style={{ flex: 1, padding: 16 }}>
			<ScreenHeaders content='IAP RAW DEBUG' />

			<View
				style={{
					padding: 12,
					borderRadius: 8,
					marginBottom: 16,
					backgroundColor: mockMode ? "#FFF4E5" : "#E5F6FF",
					borderWidth: 1,
					borderColor: mockMode ? "#FFAA33" : "#33A1FF",
				}}>
				<Text style={{ fontWeight: "600", marginBottom: 4 }}>
					Mode IAP : {mockMode ? "MOCK (Expo Go)" : "Natif"}
				</Text>
				<Text style={{ fontSize: 12, color: "#555" }}>
					{mockMode
						? "Expo Go n'inclut pas react-native-iap. Installez une Dev Client build pour tester les modules natifs."
						: "Module natif chargé depuis react-native-iap."}
				</Text>
			</View>

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
