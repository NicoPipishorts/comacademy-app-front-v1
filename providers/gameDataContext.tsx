import { QuestionData } from "@/types/userGameSessionStatus";
import React, {
	createContext,
	PropsWithChildren,
	useContext,
	useState,
} from "react";

// Define the shape of your context
interface GameContextType {
	dataGame: QuestionData[];
	setDataGame: React.Dispatch<React.SetStateAction<QuestionData[]>>;
	sessionId: number | null;
	setSessionsId: React.Dispatch<React.SetStateAction<number | null>>;
	questionsLeft: number | null;
	setQuestionsLeft: React.Dispatch<React.SetStateAction<number | null>>;
	gameStatus: "in_progress" | "finished";
	setGameStatus: React.Dispatch<
		React.SetStateAction<"in_progress" | "finished">
	>;
}

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Define the provider using React.FC, which includes children by default
export const GameProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [dataGame, setDataGame] = useState<QuestionData[]>(null);
	const [sessionId, setSessionsId] = useState<number | null>(null);
	const [questionsLeft, setQuestionsLeft] = useState<number | null>(null);
	const [gameStatus, setGameStatus] = useState<"in_progress" | "finished">(
		"in_progress"
	);

	return (
		<GameContext.Provider
			value={{
				gameStatus,
				setGameStatus,
				dataGame,
				setDataGame,
				sessionId,
				setSessionsId,
				questionsLeft,
				setQuestionsLeft,
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
