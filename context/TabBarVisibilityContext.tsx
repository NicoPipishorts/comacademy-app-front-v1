// TabBarVisibilityContext.tsx
import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

interface TabBarVisibilityContextType {
	isTabBarVisible: boolean;
	showTabBar: () => void;
	hideTabBar: () => void;
}

const TabBarVisibilityContext = createContext<
	TabBarVisibilityContextType | undefined
>(undefined);

export const useTabBarVisibility = (): TabBarVisibilityContextType => {
	const context = useContext(TabBarVisibilityContext);
	if (!context) {
		throw new Error(
			"useTabBarVisibility must be used within a TabBarVisibilityProvider"
		);
	}
	return context;
};

interface TabBarVisibilityProviderProps {
	children: ReactNode;
}

export const TabBarVisibilityProvider: React.FC<
	TabBarVisibilityProviderProps
> = ({ children }) => {
	const [isTabBarVisible, setTabBarVisible] = useState(true);

	// Memoize the functions to ensure they have stable references
	const showTabBar = useCallback(() => {
		setTabBarVisible(true);
	}, []);

	const hideTabBar = useCallback(() => {
		setTabBarVisible(false);
	}, []);

	const value = useMemo(
		() => ({ isTabBarVisible, showTabBar, hideTabBar }),
		[isTabBarVisible, showTabBar, hideTabBar]
	);

	return (
		<TabBarVisibilityContext.Provider value={value}>
			{children}
		</TabBarVisibilityContext.Provider>
	);
};
