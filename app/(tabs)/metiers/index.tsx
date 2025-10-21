import CategoriesCards from "@/components/categories/categories";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import { clearMetiersCache, useGetMetiers } from "@/hooks/useGetMetiers";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MetierList from "./list";

const Metier = () => {
	const insets = useSafeAreaInsets();
	const { auth } = useAuthSession();
	const [filterByCat, setFilterByCat] = useState<number | null>(null);
	const [activeTab, setActiveTab] = useState(0);
	const [refreshing, setRefreshing] = useState(false);

	useTrackPageMetrics({ page: "Metiers" });

	const {
		data: dataMetier,
		isLoading: isLoadingMetier,
		isFetching: isFetchingMetier,
		refetch,
	} = useGetMetiers(filterByCat);
	const { data: dataCategory } = useCategoriesFull();
	const { data: dataFavoritesMetier } = useGetFavoriteMetiers(auth?.user.id);

	const toggleTab = (index: number) => {
		setActiveTab(index);
	};

	const handleRefresh = useCallback(() => {
		setRefreshing(true);
		void (async () => {
			try {
				await clearMetiersCache(filterByCat ?? null);
				await refetch();
			} catch (error) {
				console.error("Failed to refresh metiers", error);
			} finally {
				setRefreshing(false);
			}
		})();
	}, [filterByCat, refetch]);

	const requiresFavorites = !!auth?.user?.id;
	const favoritesReady = !requiresFavorites || !!dataFavoritesMetier;

	const listDepsReady = !!dataMetier && !!dataCategory && favoritesReady;

	const canShowList = activeTab === 0 && listDepsReady;
	const canShowCategories = activeTab === 1 && !!dataCategory;

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<ScreenHeaders content='Métiers' />

			{canShowList && (
				<MetierList
					data={dataMetier}
					categories={dataCategory}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
					isLoading={isLoadingMetier || isFetchingMetier}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>
			)}

			{canShowCategories && (
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
