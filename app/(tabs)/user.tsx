import { useAuth } from "@/auth/AuthContext";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import UserAccount from "@/components/user/userAccount";
import UserResultsByCat from "@/components/user/userResultsByCat";
import { primaryBackground } from "@/constants/colors";
import useCategories from "@/hooks/useCategories";
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
	const { data: categories } = useCategories();
	const { data: answers, refetch } = useGetAllAnswers(userId, token); // Destructure refetch and isFetching from the hook
	const [refreshing, setRefreshing] = useState(false);
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	const { logout } = useAuth();

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
		// Refetch data every time the component is focused or rendered,
		// but only when the token is available and the token loading is complete
		if (token && !tokenLoading) {
			refetch();
		}
	}, [refetch, token, tokenLoading]);

	const result: ResultAccumulator = answers?.data.reduce((acc, current) => {
		const { categorie, answer } = current.attributes;

		// Initialize the category if it doesn't exist
		if (!acc[categorie]) {
			acc[categorie] = {
				total: 0,
				trueCount: 0,
			};
		}

		// Increment total count for this category
		acc[categorie].total += 1;

		// Increment true count if the answer is true
		if (answer) {
			acc[categorie].trueCount += 1;
		}

		return acc;
	}, {});

	const dynamicPadding = keyboardVisible ? 10 : 100;

	if (!categories || !answers || !result) {
		return <Loader />; // Show Loader while fetching data
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.wrapper}>
			<View style={[styles.innerWrapper, { paddingBottom: dynamicPadding }]}>
				<ScreenHeaders content={`Mon Profil ${keyboardVisible}`} />
				<TouchableOpacity onPress={() => logout()}>
					<Text>Logout</Text>
				</TouchableOpacity>
				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}>
					<UserStats categories={categories} result={result} />

					<UserResultsByCat />

					<UserAccount />
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
});
