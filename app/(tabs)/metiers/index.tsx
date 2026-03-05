import CategoriesCards from "@/components/categories/categories";
import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
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

	const canShowList = activeTab === 0;
	const canShowCategories = activeTab === 1 && !!dataCategory;
	const showCategoriesLoader = activeTab === 1 && !dataCategory;
	const showStaticHeader = activeTab !== 0;

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			{showStaticHeader && <PageTitleAvatarHeader title='Metier' />}

			{canShowList && (
				<MetierList
					data={dataMetier ?? null}
					categories={dataCategory ?? null}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
					headerTitle='Metier'
					isLoading={isLoadingMetier || isFetchingMetier || !listDepsReady}
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
			{showCategoriesLoader && <Loader />}

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
		paddingHorizontal: 24,
		paddingBottom: 25,
		backgroundColor: primaryBackground,
	},
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 145,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default Metier;
