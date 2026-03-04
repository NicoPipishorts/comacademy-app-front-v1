import { colorWhite, colorYellow } from "@/constants/colors";
import {
	resolveUserPreference,
	resolveUserPreferenceAvatarUrl,
} from "@/helpers/userPreferences";
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserPreferences from "@/hooks/useGetUserPreferences";
import { NavigationType } from "@/types/general";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React from "react";
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from "react-native";
import Loader from "../experience/loader";

interface Props {
	size?: number;
	onPress?: () => void;
	showEditBadge?: boolean;
	showBorder?: boolean;
	wrapperAlignSelf?: ViewStyle["alignSelf"];
}

const getInitial = (value?: string | null) => value?.trim().charAt(0) || "";

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

export default function AvatarInitials({
	size,
	onPress,
	showEditBadge = false,
	showBorder = false,
	wrapperAlignSelf = "flex-start",
}: Props) {
	const { auth } = useAuthSession();
	const navigation = useNavigation<NavigationType>();
	const { data, isFetched } = useGetUserPreferences(auth?.user.id);
	const preference = resolveUserPreference(data);

	const resolvedSize = size || 78;
	const badgeSize = Math.max(20, Math.floor(resolvedSize * 0.33));
	const backgroundColor = preference?.avatarBackgroundColor || colorYellow;
	const avatarUrl = resolveUserPreferenceAvatarUrl(preference);

	const prefFirstName = preference?.user?.firstName ?? null;
	const prefLastName = preference?.user?.lastName ?? null;
	const authFirstName = auth?.user?.firstName ?? null;
	const authLastName = auth?.user?.lastName ?? null;
	const resolvedFirstName = prefFirstName ?? authFirstName;
	const resolvedLastName = prefLastName ?? authLastName;

	const nameInitials = (
		getInitial(resolvedFirstName) + getInitial(resolvedLastName)
	).toUpperCase();
	const usernameInitials = getHandleInitials(auth?.user?.username);
	const emailInitials = getHandleInitials(auth?.user?.email?.split("@")[0]);
	const initialsValue = nameInitials || usernameInitials || emailInitials || "?";

	if (!isFetched) {
		return <Loader />;
	}

	const handlePress = () => {
		if (onPress) {
			onPress();
			return;
		}
		navigation.navigate("user");
	};

	return (
		<View style={[styles.wrapper, { alignSelf: wrapperAlignSelf }]}>
			<TouchableOpacity
				style={[
					styles.container,
					{
						backgroundColor,
						height: resolvedSize,
						width: resolvedSize,
						borderRadius: resolvedSize,
						borderWidth: showBorder ? 2 : 0,
						borderColor: showBorder ? colorWhite : "transparent",
					},
				]}
				onPress={handlePress}>
				{avatarUrl ? (
					<Image
						source={{ uri: avatarUrl }}
						style={{
							height: resolvedSize - (showBorder ? 4 : 0),
							width: resolvedSize - (showBorder ? 4 : 0),
							borderRadius: resolvedSize,
						}}
						resizeMode='cover'
					/>
				) : (
					<Text style={[styles.text, { fontSize: Math.floor(resolvedSize * 0.4) }]}>
						{initialsValue}
					</Text>
				)}
			</TouchableOpacity>
			{showEditBadge && (
				<View
					pointerEvents='none'
					style={[
						styles.editBadge,
						{
							height: badgeSize,
							width: badgeSize,
							borderRadius: badgeSize,
							right: -2,
							bottom: -2,
						},
					]}>
					<MaterialIcons
						name='edit'
						size={Math.max(12, Math.floor(badgeSize * 0.52))}
						color={colorWhite}
					/>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: "relative",
	},
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
		overflow: "hidden",
	},
	text: {
		color: colorWhite,
		fontWeight: "bold",
		textTransform: "uppercase",
	},
	editBadge: {
		position: "absolute",
		backgroundColor: "#272727",
		borderWidth: 1,
		borderColor: colorWhite,
		alignItems: "center",
		justifyContent: "center",
	},
});
