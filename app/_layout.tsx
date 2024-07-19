import { TabProvider } from "@/context/floatingTabbarContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { AuthProvider } from "../auth/AutContext";
import { queryClient } from "../hooks/reactQueryConfig";

export default function RootLayout() {
	return (
		<AuthProvider>
			<QueryClientProvider client={queryClient}>
				<TabProvider>
					<Stack>
						<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
						<Stack.Screen name='+not-found' />
					</Stack>
				</TabProvider>
			</QueryClientProvider>
		</AuthProvider>
	);
}
