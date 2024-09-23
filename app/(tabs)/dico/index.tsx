import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useTab } from "@/context/floatingTabbarContext";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { useDicoIds } from "@/hooks/useGetDico";
import CategoriesCards from "@/screens/CategoriesCards";
import DicoDetails from "@/screens/DicoDetails";
import DicoList from "@/screens/DicoList";
import { DicoSelected } from "@/types/dico";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const Dico = () => {
	const queryClient = useQueryClient();
	const { selectedTab, setSelectedTab } = useTab();
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<DicoSelected | null>(null);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);

	const { data: dataDico, isLoading: isLoadingData } = useDicoIds(filterByCat);
	const { data: dataCat, isLoading: isLoadingCat } = useCategoriesFull();

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["metiersList"] });
		setSelectedTab(false);
	}, [filterByCat, queryClient, setSelectedTab]);

	if (showDetails && selectedItem) {
		return (
			<DicoDetails item={selectedItem} onGoBack={() => setShowDetails(false)} />
		);
	}

	if (!dataDico && isLoadingData) {
		return <Loader />;
	}
	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Dico' />
			{isLoadingCat && <Loader />}

			{!selectedTab && !isLoadingCat && (
				<DicoList
					data={dataDico}
					categories={dataCat}
					setShowDetails={setShowDetails}
					setSelectedItem={setSelectedItem}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
				/>
			)}

			{selectedTab && (
				<CategoriesCards
					setFilterByCat={setFilterByCat}
					dataCategory={dataCat}
				/>
			)}

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					selectedTab={selectedTab}
					handlePress={handlePress}
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
	floatingTabbarContainer: {
		backgroundColor: "transparent",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 110,
		elevation: 5,
		zIndex: 1,
	},
});

export default Dico;
