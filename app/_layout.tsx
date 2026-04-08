import "react-native-reanimated";

import { TabProvider } from "@/context/floatingTabbarContext";
import { SnackbarProvider } from "@/context/snackBar";
import OtaUpdateModal from "@/components/updates/OtaUpdateModal";
import { SubscriptionProvider } from "@/providers/SubscriptionProvider";
import { NetworkProvider } from "@/providers/NetworkProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../auth/AuthContext";
import { queryClient } from "../hooks/reactQueryConfig";

// ✅ NEW import from expo-audio
import { setAudioModeAsync } from "expo-audio";

if (Platform.OS === "ios") {
	// ✅ API/prop renamed in expo-audio
	void setAudioModeAsync({
		playsInSilentMode: true,
	});
}

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<AuthProvider>
				<SubscriptionProvider>
					<QueryClientProvider client={queryClient}>
						<GestureHandlerRootView style={{ flex: 1 }}>
							<BottomSheetModalProvider>
								<PaperProvider>
									<SnackbarProvider>
										<NetworkProvider>
											<TabProvider>
												<Stack screenOptions={{ animation: "none" }}>
													<Stack.Screen
														name='(tabs)'
														options={{ headerShown: false }}
													/>
												</Stack>
												<OtaUpdateModal />
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
