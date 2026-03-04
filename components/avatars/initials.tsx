import { colorWhite, colorYellow } from "@/constants/colors";
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserPreferences from "@/hooks/useGetUserPreferences";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Loader from "../experience/loader";

interface Props {
	size?: number;
}

export default function AvatarInitials({ size }: Props) {
	const { auth } = useAuthSession();
	const navigation = useNavigation<NavigationType>();
	const {
		data,
		isFetched,
		status,
		fetchStatus,
		isLoading,
		isFetching,
		isError,
		error,
	} = useGetUserPreferences(auth?.user.id);

	const attributes = data?.data?.attributes;
	const prefFirstName = attributes?.user?.firstName ?? null;
	const prefLastName = attributes?.user?.lastName ?? null;
	const authFirstName = auth?.user?.firstName ?? null;
	const authLastName = auth?.user?.lastName ?? null;
	const resolvedFirstName = prefFirstName ?? authFirstName;
	const resolvedLastName = prefLastName ?? authLastName;
	let backgroundColor: string;

	if (!attributes?.avatarBackgroundColor) {
		backgroundColor = colorYellow;
	} else {
		backgroundColor = attributes.avatarBackgroundColor;
	}

	const getInitial = (value?: string) => {
		return value?.trim().charAt(0) || "";
	};

	const getHandleInitials = (value?: string | null) => {
		if (!value) return "";
		const normalized = value
			.replace(/([a-z])([A-Z])/g, "$1 $2")
			.replace(/[^a-zA-Z0-9]+/g, " ")
			.trim();
		if (!normalized) return "";
		const words = normalized.split(/\s+/).filter(Boolean);
		if (words.length >= 2) {
			return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
		}
		return normalized.slice(0, 2).toUpperCase();
	};

	const nameInitials = (
		getInitial(resolvedFirstName ?? undefined) +
		getInitial(resolvedLastName ?? undefined)
	).toUpperCase();
	const usernameInitials = getHandleInitials(auth?.user?.username);
	const emailInitials = getHandleInitials(auth?.user?.email?.split("@")[0]);
	const initialsValue =
		nameInitials || usernameInitials || emailInitials || "?";

	useEffect(() => {
		if (!__DEV__) return;

		console.log("[AvatarInitials] query:", {
			status,
			fetchStatus,
			isLoading,
			isFetching,
			isFetched,
			isError,
		});
		if (error) {
			console.log("[AvatarInitials] query error:", error);
		}
		console.log("[AvatarInitials] payload:", {
			userId: auth?.user?.id ?? null,
			userPreferencesData: data?.data ?? null,
			avatarBackgroundColor: attributes?.avatarBackgroundColor ?? null,
			authUser: {
				id: auth?.user?.id ?? null,
				firstName: authFirstName,
				lastName: authLastName,
				username: auth?.user?.username ?? null,
				email: auth?.user?.email ?? null,
			},
		});
		console.log("[AvatarInitials] resolved:", {
			prefFirstName,
			prefLastName,
			resolvedFirstName,
			resolvedLastName,
			nameInitials,
			usernameInitials,
			emailInitials,
			initials: initialsValue,
		});
	}, [
		attributes?.avatarBackgroundColor,
		attributes?.user?.firstName,
		attributes?.user?.lastName,
		auth?.user?.email,
		auth?.user?.firstName,
		auth?.user?.id,
		auth?.user?.lastName,
		auth?.user?.username,
		authFirstName,
		authLastName,
		data?.data,
		error,
		fetchStatus,
		initialsValue,
		isError,
		isFetched,
		isFetching,
		isLoading,
		prefFirstName,
		prefLastName,
		resolvedFirstName,
		resolvedLastName,
		nameInitials,
		usernameInitials,
		emailInitials,
		status,
	]);

	if (!isFetched) {
		return <Loader />;
	}

	return (
		<TouchableOpacity
			style={[
				styles.container,
				{
					backgroundColor: backgroundColor,
					height: size || 78,
					width: size || 78,
					borderRadius: size || 78,
				},
			]}
			onPress={() => navigation.navigate("user")}>
			<Text style={styles.text}>{initialsValue}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 5,
	},
	text: {
		fontSize: 32,
		color: colorWhite,
		fontWeight: "bold",
		textTransform: "uppercase",
	},
});
