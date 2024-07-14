import { primaryBackground } from "@/constants/colors";
import { useTab } from "@/context/floatingTabbarContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
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
	const [selectedItem, setSelectedItem] = useState(null);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);

	const { data: dataMetier } = useQuery({
		queryKey: ["metiers"],
		queryFn: () =>
			fetch(
				`${apiUrl}/metiers?${
					filterByCat === null
						? ""
						: `filters[CATEGORIE][$contains]=${filterByCat}`
				}`
			).then((res) => res.json()),
	});

	const { data: dataCategory } = useQuery({
		queryKey: ["categories"],
		queryFn: () => fetch(`${apiUrl}/categories`).then((res) => res.json()),
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

			{!selectedTab && (
				<MetierList
					data={dataMetier}
					categories={dataCategory?.data || []}
					setShowDetails={setShowDetails}
					setSelectedItem={setSelectedItem}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
				/>
			)}

			{selectedTab && <MetierCategories setFilterByCat={setFilterByCat} />}

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
