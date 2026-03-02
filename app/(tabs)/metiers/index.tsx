import CategoriesCards from "@/components/categories/categories";
import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { clearMetiersCache, useGetMetiers } from "@/hooks/useGetMetiers";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MetierList from "./list";

const Metier = () => {
	const insets = useSafeAreaInsets();
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

	const listDepsReady = !!dataMetier && !!dataCategory;

	const canShowList = activeTab === 0 && listDepsReady;
	const canShowCategories = activeTab === 1 && !!dataCategory;
	const showListLoader = activeTab === 0 && !listDepsReady;
	const showCategoriesLoader = activeTab === 1 && !dataCategory;

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
			{(showListLoader || showCategoriesLoader) && <Loader />}

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					handlePress={() => setActiveTab(activeTab === 0 ? 1 : 0)}
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
