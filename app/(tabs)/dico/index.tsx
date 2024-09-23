import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useTab } from "@/context/floatingTabbarContext";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { useDicoIds } from "@/hooks/useGetDico";
import { NavigationType } from "@/types/general";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import DicoList from "./list";

const Dico = () => {
	const queryClient = useQueryClient();
	const navigation = useNavigation<NavigationType>();
	const { filter } = useLocalSearchParams();
	const { selectedTab, setSelectedTab } = useTab();
	const [filterByCat, setFilterByCat] = useState<number | null>(null);

	const { data: dataDico, isLoading: isLoadingData } = useDicoIds(filterByCat);
	const { data: dataCat, isLoading: isLoadingCat } = useCategoriesFull();

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ["metiersList"] });
		setSelectedTab(false);
	}, [filterByCat, queryClient, setSelectedTab]);

	useEffect(() => {
		if (filter === "null") {
			setFilterByCat(null);
		} else {
			if (Number(filter)) setFilterByCat(Number(filter));
		}
	}, [filter, filterByCat]);

	const handlePress = () => {
		navigation.navigate("categories");
	};

	if (!dataDico || isLoadingData) {
		return <Loader />;
	}
	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Dico' />
			{isLoadingCat && <Loader />}

			<DicoList
				data={dataDico}
				categories={dataCat}
				filterByCat={filterByCat}
				setFilterByCat={setFilterByCat}
			/>

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
