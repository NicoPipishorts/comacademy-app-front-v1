import { useAuth } from "@/auth/AuthContext";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import ChangeAvatar from "@/components/user/changeAvatar";
import ShowNiveaux from "@/components/user/niveaux";
import UserAccount from "@/components/user/userAccount";
import UserStats from "@/components/user/userStats";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useGetRounds from "@/hooks/useGetRounds";
import { useGetUserScore } from "@/hooks/useGetUsersScore";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import React, { useEffect, useRef, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CategoryResult {
	total: number;
	trueCount: number;
}

export type ResultAccumulator = Record<number, CategoryResult>;

export default function User() {
	const { logout } = useAuth();
	const { userId } = useUserId();
	const insets = useSafeAreaInsets();
	const [refreshing, setRefreshing] = useState(false);
	const { token, loading: tokenLoading } = useJwtToken();
	const [keyboardVisible, setKeyboardVisible] = useState(false);

	const { data: scores, refetch } = useGetUserScore(token, userId);
	const { data: rounds } = useGetRounds(token);

	// useRef to store the last fetch time
	const lastFetchTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => {
				setKeyboardVisible(true);
			}
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				setKeyboardVisible(false);
			}
		);

		return () => {
			keyboardDidHideListener.remove();
			keyboardDidShowListener.remove();
		};
	}, []);

	const onRefresh = () => {
		setRefreshing(true);
		refetch().finally(() => {
			lastFetchTimeRef.current = Date.now(); // Update the last fetch time
			setTimeout(() => {
				setRefreshing(false);
			}, 2000);
		});
	};

	useEffect(() => {
		if (token && !tokenLoading) {
			refetch();
			lastFetchTimeRef.current = Date.now(); // Update the last fetch time after successful refetch
		}
	}, [refetch, token, tokenLoading]);

	// Refetch if more than 30 seconds have passed
	useEffect(() => {
		const intervalId = setInterval(() => {
			const currentTime = Date.now();
			if (currentTime - lastFetchTimeRef.current > 30000) {
				refetch();
				lastFetchTimeRef.current = currentTime; // Update last fetch time
			}
		}, 1000); // Check every second

		return () => clearInterval(intervalId); // Clean up on unmount
	}, [refetch]);

	const dynamicPadding = keyboardVisible ? 30 : 100;

	if (!scores) {
		return <Loader />;
	}

	console.log(scores.data[0].attributes.totalAnsweredQuestions);
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.wrapper}>
			<View
				style={[
					styles.innerWrapper,
					{ paddingTop: insets.top, paddingBottom: dynamicPadding },
				]}>
				<ScreenHeaders content='Mon Profil' />
				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}>
					<View>
						<ShowNiveaux
							totalPoints={scores.data[0].attributes.totalAnsweredQuestions}
						/>
					</View>

					{scores && <UserStats categoriesScore={scores} />}

					<ChangeAvatar />

					<UserAccount />

					<View style={styles.logoutContainer}>
						<TouchableOpacity
							onPress={() => logout()}
							style={styles.logoutButton}>
							<Text
								style={{
									color: colorWhite,
									fontSize: FontSize16,
									fontWeight: "bold",
								}}>
								Déconnexion
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	filterWrapper: {
		width: "100%",
		borderRadius: 20,
		backgroundColor: colorWhite,
		paddingBottom: 20,
		marginBottom: 30,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 20,
		minHeight: "60%",
	},
	innerWrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 80,
		paddingBottom: 100,
		backgroundColor: primaryBackground,
	},
	logoutContainer: {
		display: "flex",
		marginTop: 100,
		marginBottom: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	logoutButton: {
		backgroundColor: colorBlack,
		marginBottom: 20,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
});
