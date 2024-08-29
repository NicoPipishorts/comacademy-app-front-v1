import { GameData } from "@/types/game";
import React, {
	createContext,
	PropsWithChildren,
	useContext,
	useState,
} from "react";

// Define the shape of your context
interface GameContextType {
	sessionId: number;
	setSessionsId: React.Dispatch<React.SetStateAction<number>>;
	dataGame: GameData[];
	setDataGame: React.Dispatch<React.SetStateAction<GameData[]>>;
}

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Define the provider using React.FC, which includes children by default
export const GameProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [dataGame, setDataGame] = useState<GameData[]>(null);
	const [sessionId, setSessionsId] = useState<number>(null);

	return (
		<GameContext.Provider
			value={{ sessionId, setSessionsId, dataGame, setDataGame }}>
			{children}
		</GameContext.Provider>
	);
};

// Custom hook to use the GameContext
export const useGameContext = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error("useGameContext must be used within a GameProvider");
	}
	return context;
};
