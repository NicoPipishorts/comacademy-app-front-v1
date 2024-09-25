// src/context/ContextCommandements.tsx
import { CommandementsPayload } from "@/types/commandements";
import React, {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from "react";

interface ContextCommandementsType {
	data: CommandementsPayload;
	setData: Dispatch<SetStateAction<CommandementsPayload>>;
}

const ContextCommandements = createContext<
	ContextCommandementsType | undefined
>(undefined);

export const CommandementProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [data, setData] = useState<CommandementsPayload>(null);

	return (
		<ContextCommandements.Provider
			value={{
				data,
				setData,
			}}>
			{children}
		</ContextCommandements.Provider>
	);
};

export const useCommandements = (): ContextCommandementsType => {
	const context = useContext(ContextCommandements);
	if (context === undefined) {
		throw new Error("useCommandements must be used within a Commandements tab");
	}
	return context;
};
