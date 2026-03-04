import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { clearDicoCache, useDicoIds } from "@/hooks/useGetDico";
import { NavigationType } from "@/types/general";
import { useGlobalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CategoriesCards from "../../../components/categories/categories";
import DicoList from "./list";

const Dico = () => {
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationType>();
	const { openDetails } = useGlobalSearchParams();
	const [activeTab, setActiveTab] = useState(0);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const {
		data: dataDico,
		isLoading: isLoadingData,
		isFetching: isFetchingData,
		refetch,
	} = useDicoIds(filterByCat);
	const { data: dataCat, isLoading: isLoadingCat } = useCategoriesFull();

	useTrackPageMetrics({ page: "Dico" });

	useEffect(() => {
		if (openDetails) {
			navigation.navigate("dicoDetails", { id: openDetails });
		}
	}, [openDetails, navigation]);

	const handleRefresh = useCallback(() => {
		setRefreshing(true);
		void (async () => {
			try {
				await clearDicoCache(filterByCat ?? null);
				await refetch();
			} catch (error) {
				console.error("Failed to refresh dico", error);
			} finally {
				setRefreshing(false);
			}
		})();
	}, [filterByCat, refetch]);

	const listReady = !!dataDico && !!dataCat;
	const showListLoader = activeTab === 0 && !listReady;
	const showCategoriesLoader = activeTab === 1 && (!dataCat || isLoadingCat);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='Dico'
				onPressTitle={() => navigation.navigate("newPlaylist")}
			/>

			{listReady && activeTab === 0 && (
				<DicoList
					data={dataDico}
					categories={dataCat}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
					isLoading={isLoadingData || isFetchingData}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>
			)}

			{activeTab === 1 && (
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
		paddingHorizontal: 24,
		paddingBottom: 25,
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
