import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import { useGetMetiers } from "@/hooks/useGetMetiers";
import useUserId from "@/hooks/useUserId";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CategoriesCards from "./categories";
import MetierList from "./list";

const Metier = () => {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { filter } = useLocalSearchParams();
	const queryClient = useQueryClient();
	const [filterByCat, setFilterByCat] = useState<number | null>(null);
	const [activeTab, setActiveTab] = useState(0); // 0: MetierList, 1: CategoriesCards

	const { data: dataMetier, isLoading: isLoadingMetier } =
		useGetMetiers(filterByCat);
	const { data: dataCategory, isLoading: isLoadingCats } = useCategoriesFull();
	const { data: dataFavoritesMetier } = useGetFavoriteMetiers(userId);

	useEffect(() => {
		queryClient.refetchQueries({ queryKey: ["metiersList"] });
	}, [filterByCat, queryClient]);

	useEffect(() => {
		if (filter === "null") {
			setFilterByCat(null);
		} else {
			if (Number(filter)) setFilterByCat(Number(filter));
		}
	}, [filter, filterByCat]);

	if (
		isLoadingMetier ||
		isLoadingCats ||
		!dataMetier ||
		!dataCategory ||
		!dataFavoritesMetier
	) {
		return <Loader />;
	}

	const toggleTab = (index: number) => {
		setActiveTab(index);
	};

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<ScreenHeaders content='Métiers' />
			{activeTab === 0 && (
				<MetierList
					data={dataMetier}
					categories={dataCategory}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
				/>
			)}

			{activeTab === 1 && <CategoriesCards />}

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					selectedTab={activeTab === 1}
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
		padding: 30,
		backgroundColor: primaryBackground,
	},
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 120, // Adjust this value based on your design
		justifyContent: "center",
		alignItems: "center",
	},
});

export default Metier;
