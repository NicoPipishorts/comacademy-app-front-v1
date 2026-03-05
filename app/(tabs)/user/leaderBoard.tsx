import FloatingTabBar from "@/components/FloatingTabBar";
import Loader from "@/components/experience/loader";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { colorBlack, colorGrey, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import {
	AllUsersScoreResponse,
	useGetUsersScore,
	UserScoreData,
} from "@/hooks/useGetUsersScore";
import useJwtToken from "@/hooks/useJwtToken";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LeaderBoard() {
	const router = useRouter();
	const { token } = useJwtToken();
	const { auth, loading: authLoading } = useAuthSession();
	const currentUser = auth?.user.id;
	const insets = useSafeAreaInsets();

	useTrackPageMetrics({ page: "LeaderBoard" });

	const { data: userData } = useGetUserInfo(currentUser ?? 0);
	const { data: allScores } = useGetUsersScore(token);

	if (authLoading || !currentUser || !userData || !allScores) {
		return <Loader />;
	}

	const resolveScoreUserId = (user: UserScoreData): number | null => {
		const base = user?.attributes?.user;
		if (!base) return null;
		return (base as any).userId ?? base?.userId ?? base?.userId ?? null;
	};

	const getUserProfile = (user: { profile?: string; role?: string }) => {
		return user?.profile ?? user?.role ?? "";
	};

	function filterUsersByRoleAndClients(
		allScores: AllUsersScoreResponse,
		profile: string,
		currentClients: { id: number; name: string }[]
	): UserScoreData[] {
		// If no profile information, return everyone
		if (!profile) {
			return allScores.data;
		}

		// Allow admins to see everything
		if (profile === "superAdmin" || profile === "Authenticated") {
			return allScores.data;
		}

		// Helper function to extract user clients as an array
		const getUserClients = (user: any): { id: number; name: string }[] => {
			const userClients = user.attributes.user.clients;
			return Array.isArray(userClients)
				? userClients
				: userClients
				? [userClients]
				: [];
		};

		// If the current profile is "EducationPro", return all users with overlapping clients
		if (profile === "enseignant" || profile === "professionnel") {
			return allScores.data.filter((user) => {
				const userClients = getUserClients(user);

				// Skip users with different profiles
				if (
					!["enseignant", "professionnel", "etudiant"].includes(
						user.attributes.user.profile
					)
				) {
					return false;
				}

				// If both client lists are empty, show the user
				if (
					(!userClients || userClients.length === 0) &&
					(currentClients.length === 0 || !currentClients)
				) {
					return true;
				}

				// Check for overlapping clients
				return userClients.some((client) =>
					currentClients.some((currentClient) => {
						if (currentClient.id === client.id) {
							return true;
						}

						if (currentClient.id == null && client.id == null) {
							return true;
						}

						return false;
					})
				);
			});
		}

		// For other roles, filter by role and clients
		return allScores.data.filter((user) => {
			const userClients = getUserClients(user);
			const userRole = getUserProfile(user.attributes.user);

			// Skip users with different roles
			if (userRole !== profile) {
				return false;
			}

			// If both client lists are empty, include the user (matching profile)
			if (
				(!userClients || userClients.length === 0) &&
				(currentClients.length === 0 || !currentClients)
			) {
				return true;
			}

			// Match users with overlapping clients
			const hasMatchingClients = userClients.some((client) =>
				currentClients.some((currentClient) => {
					if (currentClient.id === client.id) {
						return true;
					}

					if (currentClient.id == null && client.id == null) {
						return true;
					}

					return false;
				})
			);

			return hasMatchingClients;
		});
	}

	// Find the current user's role and clients
	const currentUserInfo = allScores.data.find((user) => {
		const scoreUserId = resolveScoreUserId(user);
		return scoreUserId === currentUser;
	});

	const profile = currentUserInfo
		? getUserProfile(currentUserInfo.attributes.user)
		: "";
	const currentClients = currentUserInfo?.attributes.user.clients || [];

	// Get the filtered list of users
	const normalizedClients = Array.isArray(currentClients)
		? currentClients
		: currentClients
		? [currentClients]
		: [];

	const filteredUsers = filterUsersByRoleAndClients(
		allScores,
		profile,
		normalizedClients
	);

	const handleLeaderBoardTabPress = (tabIndex: number) => {
		if (tabIndex === 1) {
			router.replace("/user/myStats");
			return false;
		}
		return 0;
	};

	return (
		<>
			<View
				style={[
					styles.wrapper,
					{
						paddingTop: insets.top,
						paddingBottom: insets.bottom + 24,
					},
				]}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					style={styles.scrollView}
					contentContainerStyle={styles.content}>
					<PageTitleAvatarHeader title='Classement' />
					{filteredUsers.length === 0 && (
						<View style={styles.emptyState}>
							<Text style={styles.emptyStateText}>
								Aucun classement disponible pour le moment.
							</Text>
						</View>
					)}
					{filteredUsers.map((user, index) => {
						const scoreUserId = resolveScoreUserId(user);
						const isSelected = currentUser === scoreUserId;
						const firstName = user.attributes.user.firstName?.trim() || "Utilisateur";
						const lastInitial = user.attributes.user.lastName
							?.trim()
							?.slice(0, 1);
						const displayName = lastInitial
							? `${firstName} ${lastInitial}.`
							: firstName;

						return (
							<View
								key={scoreUserId ?? user.id ?? index}
								style={{
									borderBottomColor: colorGrey,
									borderBottomWidth: 1,
									marginHorizontal: 20,
								}}>
								{isSelected ? (
									<LinearGradient
										colors={["#D683EF", "#FCA9AC"]}
										start={{ x: 0, y: 0 }} // Start from the left
										end={{ x: 1, y: 0 }} // End at the right
										style={styles.resultRowSelected}>
										<View style={{ flexDirection: "row", paddingLeft: 5 }}>
											<Text style={styles.ranking}>{index + 1}</Text>
											<Text style={[styles.resultsText, { color: colorWhite }]}>
												Moi
											</Text>
										</View>
										<View style={{ flexDirection: "row", paddingRight: 5 }}>
											<Text style={[styles.resultsText, { color: colorWhite }]}>
												{user.attributes.totalScore}
											</Text>
										</View>
									</LinearGradient>
								) : (
									<View style={styles.resultRow}>
										<View style={{ flexDirection: "row", paddingLeft: 5 }}>
											<Text style={[styles.ranking, { color: colorBlack }]}>
												{index + 1}
											</Text>
											<Text style={styles.resultsText}>{displayName}</Text>
										</View>
										<View style={{ flexDirection: "row", paddingRight: 5 }}>
											<Text style={styles.resultsText}>
												{user.attributes.totalScore}
											</Text>
										</View>
									</View>
								)}
							</View>
						);
					})}
				</ScrollView>

				<View style={styles.floatingTabbarContainer}>
					<FloatingTabBar
						activeTab={0}
						setActiveTab={() => {}}
						handlePress={handleLeaderBoardTabPress}
						values={{ btn1: "Classement", btn2: "Stats" }}
					/>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingHorizontal: 24,
		backgroundColor: primaryBackground,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingBottom: 190,
	},
	resultRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 15,
	},
	resultRowSelected: {
		width: "110%",
		flexDirection: "row",
		justifyContent: "space-between",
		marginLeft: -15,
		paddingVertical: 15,
		borderRadius: 15,
		paddingHorizontal: 15,
		marginBottom: 5,
		marginTop: 5,
	},
	emptyState: {
		paddingVertical: 30,
		alignItems: "center",
	},
	emptyStateText: {
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorGrey,
		textAlign: "center",
		paddingHorizontal: 20,
	},
	floatingTabbarContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 145,
		justifyContent: "center",
		alignItems: "center",
	},
	resultsText: {
		fontSize: FontSize16,
		fontWeight: "bold",
		textTransform: "capitalize",
	},
	ranking: {
		minWidth: 40,
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorWhite,
	},
});
