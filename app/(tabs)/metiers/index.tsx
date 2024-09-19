import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useTab } from "@/context/floatingTabbarContext";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { useGetMetiers } from "@/hooks/useGetMetiers";
import { NavigationType } from "@/types/general";
import { SelectedMetier } from "@/types/metiers";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MetierList from "./list";
import MetierDetails from "./metierDetails";

const Metier = () => {
	const navigation = useNavigation<NavigationType>();
	const { filter } = useLocalSearchParams();
	const queryClient = useQueryClient();
	const { selectedTab, setSelectedTab } = useTab();
	const [showDetails, setShowDetails] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<SelectedMetier | null>(null);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);

	const { data: dataMetier, isLoading } = useGetMetiers(filterByCat);
	const { data: dataCategory } = useCategoriesFull();

	useEffect(() => {
		queryClient.refetchQueries({ queryKey: ["metiersList"] });
		setSelectedTab(false);
	}, [filterByCat, queryClient, setSelectedTab]);

	useEffect(() => {
		console.log("in the useEffect : ", filter, filterByCat);
		if (filter === "null") {
			setFilterByCat(null);
		} else {
			if (Number(filter)) setFilterByCat(Number(filter));
		}
	}, [filter, filterByCat]);

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

	const handlePress = () => {
		navigation.navigate("categories");
	};

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
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 110, // Adjust this value based on your design
		justifyContent: "center",
		alignItems: "center",
	},
});

export default Metier;
