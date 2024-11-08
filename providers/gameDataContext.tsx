import { GameSessionQuestionData } from "@/types/game";
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
	dataGame: GameSessionQuestionData[];
	setDataGame: React.Dispatch<React.SetStateAction<GameSessionQuestionData[]>>;
	questionsLeft: number;
	setQuestionsLeft: React.Dispatch<React.SetStateAction<number>>;
	currentCardId: number;
	setCurrentCardId: React.Dispatch<React.SetStateAction<number>>;
	playing: boolean;
	setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
	score: number;
	setScore: React.Dispatch<React.SetStateAction<number>>;
	showFinishedModal: boolean;
	setShowFinishedModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Define the provider using React.FC, which includes children by default
export const GameProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [dataGame, setDataGame] = useState<GameSessionQuestionData[]>(null);
	const [sessionId, setSessionsId] = useState<number>(null);
	const [questionsLeft, setQuestionsLeft] = useState<number>(null);
	const [currentCardId, setCurrentCardId] = useState<number>(null);
	const [score, setScore] = useState<number | null>(null);
	const [showFinishedModal, setShowFinishedModal] = useState<boolean>(false);
	const [playing, setPlaying] = useState<boolean>(false);

	return (
		<GameContext.Provider
			value={{
				sessionId,
				setSessionsId,
				dataGame,
				setDataGame,
				questionsLeft,
				setQuestionsLeft,
				playing,
				setPlaying,
				score,
				setScore,
				showFinishedModal,
				setShowFinishedModal,
				currentCardId,
				setCurrentCardId,
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
