import { TabProvider } from "@/context/floatingTabbarContext";
import { SnackbarProvider } from "@/context/snackBar";
import { NetworkProvider } from "@/providers/NetworkProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { setAudioModeAsync } from "expo-audio";
import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "../auth/AuthContext";
import { queryClient } from "../hooks/reactQueryConfig";

if (Platform.OS === "ios") {
	void setAudioModeAsync({ playsInSilentModeIOS: true });
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<QueryClientProvider client={queryClient}>
				<GestureHandlerRootView>
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
								</TabProvider>
							</NetworkProvider>
						</SnackbarProvider>
					</PaperProvider>
				</GestureHandlerRootView>
			</QueryClientProvider>
		</AuthProvider>
	);
}
