// src/context/TabContext.tsx
import React, {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from "react";

interface TabContextType {
	selectedTab: boolean;
	setSelectedTab: Dispatch<SetStateAction<boolean>>;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [selectedTab, setSelectedTab] = useState<boolean>(false);

	return (
		<TabContext.Provider value={{ selectedTab, setSelectedTab }}>
			{children}
		</TabContext.Provider>
	);
};

export const useTab = (): TabContextType => {
	const context = useContext(TabContext);
	if (context === undefined) {
		throw new Error("useTab must be used within a TabProvider");
	}
	return context;
};
