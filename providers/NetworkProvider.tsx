// NetworkProvider.tsx
import { useSnackbar } from "@/context/snackBar";
import NetInfo from "@react-native-community/netinfo";
import React, { createContext, useContext, useEffect, useState } from "react";

interface NetworkContextType {
	isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isConnected, setIsConnected] = useState<boolean>(true);
	const showSnackbar = useSnackbar();

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			const { isConnected } = state;

			if (isConnected !== null && isConnected !== undefined) {
				setIsConnected(isConnected);

				// Show a snackbar message if the connection is lost
				if (!isConnected) {
					showSnackbar("No internet connection", "error");
				}
			}
		});

		return () => {
			unsubscribe();
		};
	}, [showSnackbar]);

	return (
		<NetworkContext.Provider value={{ isConnected }}>
			{children}
		</NetworkContext.Provider>
	);
};

// Custom hook to use the Network context
export const useNetwork = () => {
	const context = useContext(NetworkContext);
	if (!context) {
		throw new Error("useNetwork must be used within a NetworkProvider");
	}
	return context;
};
