import { useAuth } from "@/auth/AuthContext";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import UserAccount from "@/components/user/userAccount";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useGetAllAnswers from "@/hooks/useGetAllAnswers";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import React, { useEffect, useState } from "react";
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
import UserStats from "../../components/user/userStats";

// Define the type for the accumulator object
interface CategoryResult {
	total: number;
	trueCount: number;
}

export type ResultAccumulator = Record<number, CategoryResult>;

export default function User() {
	const { userId } = useUserId();
	const { token, loading: tokenLoading } = useJwtToken();
	const [refreshing, setRefreshing] = useState(false);
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	const { logout } = useAuth();

	const { data: answers, refetch } = useGetAllAnswers(userId, token); // Destructure refetch and isFetching from the hook

	console.log(answers);
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => {
				setKeyboardVisible(true); // Set keyboardVisible to true when the keyboard is shown
			}
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				setKeyboardVisible(false); // Set keyboardVisible to false when the keyboard is hidden
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
			setTimeout(() => {
				setRefreshing(false);
			}, 2000);
		});
	};

	useEffect(() => {
		if (token && !tokenLoading) {
			refetch();
		}
	}, [refetch, token, tokenLoading]);

	const dynamicPadding = keyboardVisible ? 30 : 100;

	if (!answers) {
		return <Loader />; // Show Loader while fetching data
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.wrapper}>
			<View style={[styles.innerWrapper, { paddingBottom: dynamicPadding }]}>
				<ScreenHeaders content='Mon Profil' />
				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}>
					<UserStats categoriesScore={answers} />

					{/* <UserResultsByCat /> */}

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
