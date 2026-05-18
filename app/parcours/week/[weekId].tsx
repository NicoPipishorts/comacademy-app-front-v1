import { useParcoursWeek } from "@/api/parcours/useParcours";
import ReturnButton from "@/components/buttons/returnButton";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import Loader from "@/components/experience/loader";
import ParcoursWeekDayCard from "@/components/parcours/ParcoursWeekDayCard";
import ParcoursWeekProgressCard from "@/components/parcours/ParcoursWeekProgressCard";
import {
	colorBlack,
	primaryBackground,
} from "@/constants/colors";
import {
	FontSize16,
} from "@/constants/fontsizes";
import useJwtToken from "@/hooks/useJwtToken";
import { getCurrentReadyParcoursDayId } from "@/helpers/parcours/week";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ParcoursWeekScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ weekId?: string | string[] }>();
	const weekId = Number(Array.isArray(params.weekId) ? params.weekId[0] : params.weekId);
	const { token, loading: loadingToken } = useJwtToken();
	const { data, isLoading } = useParcoursWeek(
		Number.isFinite(weekId) ? weekId : null,
		token,
		loadingToken
	);

	if (isLoading) {
		return <Loader />;
	}

	const week = data?.data;
	const currentReadyDayId = week
		? getCurrentReadyParcoursDayId(week.days || [])
		: null;
	const contentBottomPadding = insets.bottom + 124;
	const floatingButtonBottom = Math.max(insets.bottom, 14);

	if (!week) {
		return (
			<View style={[styles.wrapper, { paddingTop: insets.top }]}>
				<Stack.Screen options={{ headerShown: false, presentation: "card" }} />
				<PageTitleAvatarHeader
					title='Activités'
					showAvatar={false}
					containerStyle={styles.headerContainer}
					contentStyle={styles.headerContent}
				/>
				<EmptyWeekState />
			</View>
		);
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<Stack.Screen options={{ headerShown: false, presentation: "card" }} />
			<PageTitleAvatarHeader
				title='Activités'
				showAvatar={false}
				containerStyle={styles.headerContainer}
				contentStyle={styles.headerContent}
			/>
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: contentBottomPadding,
				}}
				showsVerticalScrollIndicator={false}>
				<ParcoursWeekProgressCard week={week} />
				<View style={styles.daysList}>
					{week.days?.map((day) => (
						<ParcoursWeekDayCard
							key={day.id}
							day={day}
							isCurrentReadyDay={day.id === currentReadyDayId}
							onPress={() =>
								router.push({
									pathname: "/parcours/day/[dayId]",
									params: { dayId: String(day.id) },
								})
							}
						/>
					))}
				</View>
			</ScrollView>
			<View
				pointerEvents='box-none'
				style={[styles.floatingReturnWrap, { bottom: floatingButtonBottom }]}>
				<ReturnButton variant='floating' />
			</View>
		</View>
	);
}

function EmptyWeekState() {
	return (
		<View style={styles.emptyState}>
			<Text style={styles.emptyTitle}>Semaine introuvable</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	headerContainer: {
		paddingHorizontal: 24,
		paddingBottom: 4,
	},
	headerContent: {
		paddingTop: 10,
		paddingBottom: 4,
	},
	daysList: {
		gap: 16,
		paddingTop: 22,
	},
	floatingReturnWrap: {
		position: "absolute",
		left: 0,
		right: 0,
		alignItems: "center",
	},
	emptyState: {
		flex: 1,
		paddingHorizontal: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyTitle: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
	},
});
