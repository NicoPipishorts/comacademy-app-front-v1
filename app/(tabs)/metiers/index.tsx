import CategoriesCards from "@/components/categories/categories";
import Loader from "@/components/experience/loader";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import { useGetMetiers } from "@/hooks/useGetMetiers";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MetierListSkeleton from "./MetierListSkeleton";
import MetierList from "./list";

const Metier = () => {
	const insets = useSafeAreaInsets();
	const { auth } = useAuthSession();
	const [filterByCat, setFilterByCat] = useState<number | null>(null);
	const [activeTab, setActiveTab] = useState(0);

	useTrackPageMetrics({ page: "Metiers" });

	const {
		data: dataMetier,
		isLoading: isLoadingMetier,
		isFetching: isFetchingMetier,
	} = useGetMetiers(filterByCat);
	const { data: dataCategory, isLoading: isLoadingCats } = useCategoriesFull();
	const {
		data: dataFavoritesMetier,
		isLoading: isLoadingFavorites,
	} = useGetFavoriteMetiers(auth?.user.id);

	const toggleTab = (index: number) => {
		setActiveTab(index);
	};

	const requiresFavorites = !!auth?.user?.id;
	const favoritesReady = !requiresFavorites || !!dataFavoritesMetier;
	const favoritesLoading = requiresFavorites && isLoadingFavorites && !dataFavoritesMetier;

	const listDepsReady = !!dataMetier && !!dataCategory && favoritesReady;

	const showSkeletonList =
		activeTab === 0 &&
		!listDepsReady &&
		(isLoadingMetier || isFetchingMetier);

	const showListLoader =
		activeTab === 0 &&
		!listDepsReady &&
		!showSkeletonList &&
		!favoritesLoading;

	const canShowList = activeTab === 0 && listDepsReady;
	const canShowCategories = activeTab === 1 && !!dataCategory;

	const showCategoriesLoader =
		activeTab === 1 && (!dataCategory || isLoadingCats);

	const showFavoritesLoader =
		activeTab === 0 &&
		!showSkeletonList &&
		!listDepsReady &&
		favoritesLoading;

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<ScreenHeaders content='Métiers' />

			{showSkeletonList && <MetierListSkeleton />}

			{canShowList && (
				<MetierList
					data={dataMetier}
					categories={dataCategory}
					filterByCat={filterByCat}
					setFilterByCat={setFilterByCat}
					isLoading={isLoadingMetier || isFetchingMetier}
				/>
			)}

			{canShowCategories && (
				<CategoriesCards
					setFilterByCat={setFilterByCat}
					setActiveTab={setActiveTab}
				/>
			)}

			{showListLoader && <Loader />}
			{showCategoriesLoader && <Loader />}
			{showFavoritesLoader && <Loader />}

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
