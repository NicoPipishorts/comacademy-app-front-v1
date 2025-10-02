import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { useDicoIds } from "@/hooks/useGetDico";
import { NavigationType } from "@/types/general";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import CategoriesCards from "../../../components/categories/categories";
import DicoList from "./list";

const Dico = () => {
	const navigation = useNavigation<NavigationType>();
	const { openDetails } = useGlobalSearchParams();
	const [activeTab, setActiveTab] = useState(0);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);

	const { data: dataDico, isLoading: isLoadingData } = useDicoIds(filterByCat);
	const { data: dataCat, isLoading: isLoadingCat } = useCategoriesFull();

	useTrackPageMetrics({ page: "Dico" });

	useEffect(() => {
		if (openDetails) {
			navigation.navigate("dicoDetails", { id: openDetails });
		}
	}, [openDetails, navigation]);

	const toggleTab = (index: number) => {
		setActiveTab(index);
	};

	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Dico' />

			{!dataDico && isLoadingCat && <Loader />}
			{dataDico && activeTab === 0 && (
				<DicoList
					data={dataDico}
					categories={dataCat}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
				/>
			)}

			{activeTab === 1 && (
				<CategoriesCards
					setFilterByCat={setFilterByCat}
					setActiveTab={setActiveTab}
				/>
			)}

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					handlePress={() => toggleTab(activeTab === 0 ? 1 : 0)}
					values={{ btn1: "Voir Tout", btn2: "Catégories" }}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 25,
		paddingTop: 55,
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
