import SkeletonBlock from "@/components/experience/SkeletonBlock";
import AnswersCard from "@/components/leJeu/answers/AnswersCard";
import {
	colorBlack,
	colorDarkGrey,
	colorTurquoise,
	colorTurquoiseRGB,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import { useGetUserAnswers } from "@/hooks/useGetAllAnswers";

import useJwtToken from "@/hooks/useJwtToken";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

const sessionDateFormatter = new Intl.DateTimeFormat("fr-FR", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

export default function Answers() {
	const { token } = useJwtToken();
	const { auth } = useAuthSession();

	useTrackPageMetrics({ page: "AllAnswers" });

	const {
		data: all,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	} = useGetUserAnswers({
		token,
		userId: auth?.user.id,
		limit: 10,
	});
	const firstPage = all?.pages[0];
	const isLoadingAnswers = !!auth?.user.id && isLoading;

	const hasAnswers = (all?.pages.flatMap((page) => page.data).length ?? 0) > 0;
	const groupedAnswers = all?.pages.flatMap((page) => page.data) ?? [];

	const getSessionDateLabel = (completedAt?: string | null) => {
		if (!completedAt) {
			return null;
		}

		const parsedDate = new Date(completedAt);
		if (Number.isNaN(parsedDate.getTime())) {
			return null;
		}

		return sessionDateFormatter.format(parsedDate);
	};

	const progressBarProgressions = () => {
		if (!firstPage) {
			return 0;
		}
		if (firstPage.allUserQuestions === 0) {
			return 0;
		}

		const progress = firstPage.allUserQuestions / firstPage.allQuestions;

		return Math.min(Math.max(progress, 0), 1) * 100;
	};

	return (
		<FlatList
			showsVerticalScrollIndicator={false}
			contentContainerStyle={[styles.wrapper, { paddingBottom: 100 }]}
			style={{ flex: 1 }}
			data={groupedAnswers}
			keyExtractor={(group) => `session-${group.gameId}`}
			onEndReachedThreshold={0.35}
			onEndReached={() => {
				if (hasNextPage && !isFetchingNextPage) {
					void fetchNextPage();
				}
			}}
			ListHeaderComponent={
				<>
					<View style={styles.cardContainer}>
						<View style={styles.cardResults}>
							{isLoadingAnswers ? (
								<View style={styles.pointsSkeletonRow}>
									<Text style={styles.pointsNumberSkeletonMain}>88</Text>
									<Text style={styles.pointsNumberSkeletonSide}>/ 88</Text>
								</View>
							) : (
								<>
									<Text style={styles.cardResultsLarge}>
										{firstPage?.allUserQuestions ?? 0}
									</Text>
									<Text style={styles.cardResultsSmall}>
										/ {firstPage?.allQuestions ?? 0}
									</Text>
								</>
							)}
						</View>
						<View style={styles.cardProgressContainer}>
							{isLoadingAnswers ? (
								<SkeletonBlock style={styles.progressSkeleton} />
							) : (
								<View
									style={[
										styles.cardProgressBar,
										{ width: `${progressBarProgressions()}%` },
									]}
								/>
							)}
						</View>
						<Text style={styles.cardUnlocked}>Bonnes réponses</Text>
					</View>

					<View style={styles.answersIntro}>
						<Text style={styles.answersIntroText}>
							Voici toutes tes réponses ! Sois gentil, révise bien celles indiquées
							en rouge, tu vas retomber dessus. Un autre conseil ? Révise aussi
							celles en vert, au cas où tu aurais répondu au pif 😜
						</Text>
					</View>
				</>
			}
			renderItem={({ item }) => (
				<View style={styles.sessionGroup}>
					<View style={styles.sessionGroupHeader}>
						<View style={styles.sessionAccent} />
						<Text style={styles.sessionGroupDate}>
							{getSessionDateLabel(item.completedAt) ?? "Partie récente"}
						</Text>
					</View>
					<View style={styles.sessionGroupBody}>
					{item.answers.map((answer) => (
						<AnswersCard
							key={answer.id}
							id={answer.attributes.questionId}
							answerDocumentId={answer.attributes.answerDocumentId}
							questionDocumentId={answer.attributes.questionDocumentId}
							data={answer.attributes}
						/>
					))}
					</View>
				</View>
			)}
			ListEmptyComponent={
				isLoadingAnswers ? (
					<View style={{ paddingTop: 40, width: "100%" }}>
						{Array.from({ length: 8 }).map((_, index) => (
							<View key={`skeleton-${index}`} style={styles.answerSkeletonCard}>
								<SkeletonBlock style={styles.answerSkeletonQuestion} />
								<SkeletonBlock style={styles.answerSkeletonQuestionShort} />
								<View style={styles.answerSkeletonFooter}>
									<SkeletonBlock style={styles.answerSkeletonBadge} />
								</View>
							</View>
						))}
					</View>
				) : (
					<View style={styles.emptyStateContainer}>
						<Text style={styles.emptyStateText}>
							Tu n'as pas encore de réponses enregistrées. Lance une partie
							pour commencer à remplir ton historique.
						</Text>
					</View>
				)
			}
			ListFooterComponent={
				isFetchingNextPage ? (
					<View style={styles.loaderFooter}>
						<ActivityIndicator color={colorBlack} />
					</View>
				) : hasAnswers ? <View style={styles.footerSpacer} /> : null
			}
		/>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 20,
		paddingBottom: 100,
		backgroundColor: primaryBackground,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	cardContainer: {
		minWidth: "100%",
		borderRadius: 18,
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: colorBlack,
	},
	cardResults: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
	},
	cardResultsLarge: {
		fontSize: 76,
		fontWeight: "bold",
		color: colorWhite,
	},
	cardResultsSmall: {
		fontSize: FontSize16,
		color: colorWhite,
		paddingBottom: 10,
	},
	cardProgressContainer: {
		overflow: "hidden",
		minWidth: "100%",
		minHeight: 10,
		marginTop: 5,
		marginBottom: 15,
		borderRadius: 50,
		backgroundColor: `rgba(${colorTurquoiseRGB}, 0.2)`,
	},
	cardProgressBar: {
		minHeight: 10,
		borderRadius: 50,
		backgroundColor: colorTurquoise,
	},
	cardUnlocked: {
		fontSize: FontSize14,
		color: colorWhite,
		fontWeight: "bold",
	},
	answersIntro: {
		paddingVertical: 20,
	},
	answersIntroText: {
		fontSize: FontSize14,
		fontWeight: "bold",
		paddingHorizontal: 10,
	},
	sessionGroup: {
		width: "100%",
		marginTop: 20,
	},
	sessionGroupHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
		paddingHorizontal: 4,
	},
	sessionAccent: {
		width: 10,
		height: 10,
		borderRadius: 999,
		marginRight: 10,
		backgroundColor: colorBlack,
	},
	sessionGroupDate: {
		fontSize: FontSize14,
		fontWeight: "bold",
		color: colorDarkGrey,
		textTransform: "capitalize",
	},
	sessionGroupBody: {
		borderRadius: 20,
		paddingTop: 10,

	},
	pointsSkeletonRow: {
		flexDirection: "row",
		alignItems: "flex-end",
	},
	pointsNumberSkeletonMain: {
		fontSize: 76,
		fontWeight: "bold",
		color: "rgba(255,255,255,0.2)",
	},
	pointsNumberSkeletonSide: {
		fontSize: FontSize16,
		color: "rgba(255,255,255,0.2)",
		paddingBottom: 10,
		marginLeft: 8,
	},
	progressSkeleton: {
		width: "100%",
		height: 10,
		borderRadius: 50,
		backgroundColor: "rgba(255,255,255,0.18)",
	},
	answerSkeletonCard: {
		width: "100%",
		marginBottom: 30,
		borderRadius: 15,
		padding: 15,
		paddingBottom: 10,
		backgroundColor: colorWhite,
	},
	answerSkeletonQuestion: {
		height: 18,
		width: "90%",
		marginBottom: 10,
	},
	answerSkeletonQuestionShort: {
		height: 18,
		width: "68%",
	},
	answerSkeletonFooter: {
		alignItems: "flex-end",
		marginTop: 14,
	},
	answerSkeletonBadge: {
		width: 76,
		height: 34,
		borderRadius: 10,
	},
	emptyStateContainer: {
		padding: 24,
		borderRadius: 18,
		backgroundColor: colorWhite,
		alignItems: "center",
	},
	emptyStateText: {
		fontSize: FontSize16,
		textAlign: "center",
	},
	loaderFooter: {
		paddingVertical: 24,
	},
	footerSpacer: {
		height: 24,
	},
});
