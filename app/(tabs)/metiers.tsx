import Loader from "@/components/experience/loader";
import { primaryBackground } from "@/constants/colors";
import { useTab } from "@/context/floatingTabbarContext";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { useGetMetiers } from "@/hooks/useGetMetiers";
import { SelectedMetier } from "@/types/metiers";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import FloatingTabBar from "../../components/FloatingTabBar";
import ScreenHeaders from "../../components/ScreenHeaders";
import CategoriesCards from "../../screens/CategoriesCards";
import MetierDetails from "../../screens/MetierDetails";
import MetierList from "../../screens/MetierList";

const Metier = () => {
	const queryClient = useQueryClient();
	const { selectedTab, setSelectedTab } = useTab();
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<SelectedMetier | null>(null);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);

	const { data: dataMetier, isLoading } = useGetMetiers(filterByCat);
	const { data: dataCategory } = useCategoriesFull();

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["metiersList"] });
		setSelectedTab(false);
	}, [filterByCat, queryClient, setSelectedTab]);

	if (showDetails && selectedItem) {
		return (
			<MetierDetails
				item={selectedItem}
				onGoBack={() => setShowDetails(false)}
			/>
		);
	}

	if (isLoading && !dataMetier && !dataCategory) {
		return <Loader />;
	}
	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Métiers' />

			{!selectedTab && (
				<MetierList
					data={dataMetier}
					categories={dataCategory}
					setShowDetails={setShowDetails}
					setSelectedItem={setSelectedItem}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
				/>
			)}

			{selectedTab && (
				<CategoriesCards
					setFilterByCat={setFilterByCat}
					dataCategory={dataCategory}
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
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 110, // Adjust this value based on your design
		justifyContent: "center",
		alignItems: "center",
	},
});

export default Metier;
