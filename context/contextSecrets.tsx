// src/context/contextSecrets.tsx
import { SecretsResponse } from "@/types/secrets";
import React, {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from "react";

interface contextSecretsType {
	data: SecretsResponse;
	setData: Dispatch<SetStateAction<SecretsResponse>>;
}

const contextSecrets = createContext<contextSecretsType | undefined>(undefined);

export const SecretsProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [data, setData] = useState<SecretsResponse>(null);

	return (
		<contextSecrets.Provider
			value={{
				data,
				setData,
			}}>
			{children}
		</contextSecrets.Provider>
	);
};

export const useSecrets = (): contextSecretsType => {
	const context = useContext(contextSecrets);
	if (context === undefined) {
		throw new Error("useCommandements must be used within a Commandements tab");
	}
	return context;
};
