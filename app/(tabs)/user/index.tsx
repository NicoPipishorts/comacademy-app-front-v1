import { useAuth } from "@/auth/AuthContext";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import ChangeAvatar from "@/components/user/changeAvatar";
import UserAccount from "@/components/user/userAccount";
import UserStats from "@/components/user/userStats";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { useGetAllScores } from "@/hooks/useGetAllAnswers";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define the type for the accumulator object
interface CategoryResult {
	total: number;
	trueCount: number;
}

export type ResultAccumulator = Record<number, CategoryResult>;

export default function User() {
	const insets = useSafeAreaInsets();
	const { userId } = useUserId();
	const { token, loading: tokenLoading } = useJwtToken();
	const [refreshing, setRefreshing] = useState(false);
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	const { logout } = useAuth();

	const { data: answers, refetch } = useGetAllScores(userId, token);

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
		return <Loader />;
	}

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
					<UserStats categoriesScore={answers} />

					{/* <UserResultsByCat /> */}

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
