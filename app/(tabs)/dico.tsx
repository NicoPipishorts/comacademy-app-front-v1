import { colorYellow, primaryBackground } from "@/constants/colors";
import { useTab } from "@/context/floatingTabbarContext";
import useCategoriesFull from "@/hooks/useCategoriesFiull";
import { useDicoIds } from "@/hooks/useGetDico";
import useJwtToken from "@/hooks/useJwtToken";
import DicoDetails from "@/screens/DicoDetails";
import DicoList from "@/screens/DicoList";
import { DicoSelected } from "@/types/dico";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import FloatingTabBar from "../../components/FloatingTabBar";
import ScreenHeaders from "../../components/ScreenHeaders";

const Dico = () => {
	const queryClient = useQueryClient();
	const { selectedTab, setSelectedTab } = useTab();
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<DicoSelected | null>(null);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);
	const { token } = useJwtToken();

	const { data: dataDico, isLoading: isLoadingDico } = useDicoIds();
	const { data: dataCat, isLoading: isLoadingCat } = useCategoriesFull();

	if (showDetails && selectedItem) {
		return (
			<DicoDetails item={selectedItem} onGoBack={() => setShowDetails(false)} />
		);
	}

	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Dico' />
			{isLoadingDico && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color={colorYellow} />
				</View>
			)}

			{!selectedTab && !isLoadingDico && (
				<DicoList
					data={dataDico}
					categories={dataCat}
					setShowDetails={setShowDetails}
					setSelectedItem={setSelectedItem}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
				/>
			)}

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					selectedTab={selectedTab}
					setSelectedTab={setSelectedTab}
					values={{ btn1: "Voir Tout", btn2: "Catégories" }}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 80,
		backgroundColor: primaryBackground,
	},
	loadingContainer: {
		paddingTop: "60%",
		justifyContent: "center",
		alignItems: "center",
	},
	floatingTabbarContainer: {
		backgroundColor: "transparent",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 113,
		elevation: 5,
		zIndex: 1,
	},
});

export default Dico;
