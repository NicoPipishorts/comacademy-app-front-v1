import { GameScore } from "@/hooks/useGetScore";
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
	questionsLeft: number;
	setQuestionsLeft: React.Dispatch<React.SetStateAction<number>>;
	score: GameScore;
	setScore: React.Dispatch<React.SetStateAction<GameScore>>;
}

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Define the provider using React.FC, which includes children by default
export const GameProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [dataGame, setDataGame] = useState<GameData[]>(null);
	const [sessionId, setSessionsId] = useState<number>(null);
	const [questionsLeft, setQuestionsLeft] = useState<number>(null);
	const [score, setScore] = useState<GameScore | null>(null);

	return (
		<GameContext.Provider
			value={{
				sessionId,
				setSessionsId,
				dataGame,
				setDataGame,
				questionsLeft,
				setQuestionsLeft,
				score,
				setScore,
			}}>
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
