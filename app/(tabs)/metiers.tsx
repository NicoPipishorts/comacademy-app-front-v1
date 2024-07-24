import { colorYellow, primaryBackground } from "@/constants/colors";
import { useTab } from "@/context/floatingTabbarContext";
import { SelectedMetier } from "@/types/metiers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import FloatingTabBar from "../../components/FloatingTabBar";
import ScreenHeaders from "../../components/ScreenHeaders";
import MetierCategories from "../../screens/MetierCategories";
import MetierDetails from "../../screens/MetierDetails";
import MetierList from "../../screens/MetierList";

const Metier = () => {
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;
	const queryClient = useQueryClient();
	const { selectedTab, setSelectedTab } = useTab();
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<SelectedMetier | null>(null);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);

	const { data: dataMetier, isLoading } = useQuery({
		queryKey: ["metiersList"],
		queryFn: () =>
			fetch(
				`${apiUrl}/metiers?${
					filterByCat === null
						? "fields[0]=METIER&_fields=id,METIER&filters[CATEGORIE][$notContains]=&filters[CATEGORIE][$notContains]=,,,"
						: `fields[0]=METIER&_fields=id,METIER&filters[CATEGORIE][$notContains]=&filters[CATEGORIE][$notContains]=,,,&filters[CATEGORIE][$contains]=${filterByCat}`
				}`
			).then((res) => res.json()),
	});

	const { data: dataCategory } = useQuery({
		queryKey: ["categories"],
		queryFn: () =>
			fetch(`${apiUrl}/categories?populate=*`).then((res) => res.json()),
	});

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["metiers"] });
		setSelectedTab(false);
	}, [filterByCat, queryClient]);

	if (showDetails && selectedItem) {
		return (
			<MetierDetails
				item={selectedItem}
				onGoBack={() => setShowDetails(false)}
			/>
		);
	}

	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Métiers' />
			{isLoading && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color={colorYellow} />
				</View>
			)}
			{!selectedTab && !isLoading && (
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
				<MetierCategories
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

export default Metier;
