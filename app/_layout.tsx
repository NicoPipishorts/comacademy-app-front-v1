import "react-native-reanimated";

import AnalyticsSessionTracker from "@/components/AnalyticsSessionTracker";
import LogOverlay from "@/components/LogOverlay";
import { TabProvider } from "@/context/floatingTabbarContext";
import { SnackbarProvider } from "@/context/snackBar";
import { SubscriptionProvider } from "@/providers/SubscriptionProvider";
import { NetworkProvider } from "@/providers/NetworkProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import * as Updates from "expo-updates";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../auth/AuthContext";
import { logDevice } from "../helpers/logDevice";
import { queryClient } from "../hooks/reactQueryConfig";

// ✅ NEW import from expo-audio
import { setAudioModeAsync } from "expo-audio";

const shouldShowDeviceLogs =
	__DEV__ ||
	process.env.EXPO_PUBLIC_SHOW_DEVICE_LOGS === "1" ||
	process.env.EXPO_PUBLIC_SHOW_DEVICE_LOGS === "true";

if (Platform.OS === "ios") {
	// ✅ API/prop renamed in expo-audio
	void setAudioModeAsync({
		playsInSilentMode: true,
	});
}

export default function RootLayout() {
	useEffect(() => {
		logDevice("[App] runtime info", {
			channel: typeof Updates.channel === "string" ? Updates.channel : null,
			updateId:
				typeof Updates.updateId === "string" ? Updates.updateId : null,
			isEmbeddedLaunch:
				typeof Updates.isEmbeddedLaunch === "boolean"
					? Updates.isEmbeddedLaunch
					: null,
			runtimeVersion:
				typeof Updates.runtimeVersion === "string"
					? Updates.runtimeVersion
					: null,
		});
	}, []);

	return (
		<SafeAreaProvider>
			<AuthProvider>
				<AnalyticsSessionTracker />
				<SubscriptionProvider>
					<QueryClientProvider client={queryClient}>
						<GestureHandlerRootView style={{ flex: 1 }}>
							<BottomSheetModalProvider>
								<PaperProvider>
									<SnackbarProvider>
										<NetworkProvider>
											<TabProvider>
												<Stack screenOptions={{ animation: "none", headerShown: false }}>
													<Stack.Screen
														name='(tabs)'
														options={{ headerShown: false }}
													/>
													<Stack.Screen
														name='parcours'
														options={{ headerShown: false }}
													/>
												</Stack>
												{shouldShowDeviceLogs ? <LogOverlay /> : null}
											</TabProvider>
										</NetworkProvider>
									</SnackbarProvider>
								</PaperProvider>
							</BottomSheetModalProvider>
						</GestureHandlerRootView>
					</QueryClientProvider>
				</SubscriptionProvider>
			</AuthProvider>
		</SafeAreaProvider>
	);
}
