import { TabProvider } from "@/context/floatingTabbarContext";
import { SnackbarProvider } from "@/context/snackBar";
import { NetworkProvider } from "@/providers/NetworkProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";
import { AuthProvider } from "../auth/AuthContext";
import { queryClient } from "../hooks/reactQueryConfig";

// This is the default configuration
configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false, // Reanimated runs in strict mode by default
});

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
										<Stack.Screen name='+not-found' />
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
