import { ServerCommunicationModal } from "@/components/server-communication-modal";
import {
	ApiFailoverSnapshot,
	getApiFailoverSnapshot,
	initializeApiFailover,
	refreshApiAvailability,
	subscribeToApiFailover,
} from "@/services/api-failover";
import React, { createContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";

const PRIMARY_RECHECK_INTERVAL_MS = 60_000;
const ApiFailoverContext = createContext<ApiFailoverSnapshot | undefined>(undefined);

export function useApiFailover(): ApiFailoverSnapshot {
	const context = React.use(ApiFailoverContext);
	if (!context) {
		throw new Error("useApiFailover must be used within ApiFailoverProvider");
	}
	return context;
}

export function ApiFailoverProvider({ children }: { children: React.ReactNode }) {
	const [ready, setReady] = useState(false);
	const [apiState, setApiState] = useState<ApiFailoverSnapshot>(
		getApiFailoverSnapshot(),
	);
	const [modalVisible, setModalVisible] = useState(false);
	const lastAlertedRoute = useRef<ApiFailoverSnapshot["route"] | null>(null);

	useEffect(() => {
		const applySnapshot = (next: ApiFailoverSnapshot) => {
			setApiState(next);
			if (next.route !== "unavailable") {
				lastAlertedRoute.current = null;
				setModalVisible(false);
			}
			if (
				next.route === "unavailable" &&
				lastAlertedRoute.current !== next.route
			) {
				lastAlertedRoute.current = next.route;
				setModalVisible(true);
			}
		};

		const unsubscribe = subscribeToApiFailover(applySnapshot);
		void initializeApiFailover()
			.then(applySnapshot)
			.finally(() => setReady(true));

		return unsubscribe;
	}, []);

	useEffect(() => {
		if (!ready || apiState.route === "primary") return undefined;

		const interval = setInterval(() => {
			void refreshApiAvailability();
		}, PRIMARY_RECHECK_INTERVAL_MS);
		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") void refreshApiAvailability();
		});

		return () => {
			clearInterval(interval);
			subscription.remove();
		};
	}, [apiState.route, ready]);

	if (!ready) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator size='small' />
			</View>
		);
	}

	return (
		<ApiFailoverContext.Provider value={apiState}>
			{children}
			<ServerCommunicationModal
				onClose={() => setModalVisible(false)}
				visible={modalVisible}
			/>
		</ApiFailoverContext.Provider>
	);
}

const styles = StyleSheet.create({
	loading: {
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		flex: 1,
		justifyContent: "center",
	},
});
