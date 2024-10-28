import { TabProvider } from "@/context/floatingTabbarContext";
import { SnackbarProvider } from "@/context/snackBar";
import { NetworkProvider } from "@/providers/NetworkProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { AuthProvider } from "../auth/AuthContext";
import { queryClient } from "../hooks/reactQueryConfig";

export default function RootLayout() {
	return (
		<AuthProvider>
			<QueryClientProvider client={queryClient}>
				<SnackbarProvider>
					<NetworkProvider>
						<TabProvider>
							<Stack>
								<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
								<Stack.Screen name='+not-found' />
							</Stack>
						</TabProvider>
					</NetworkProvider>
				</SnackbarProvider>
			</QueryClientProvider>
		</AuthProvider>
	);
}
