import { colorWhite, colorYellow } from "@/constants/colors";
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserPreferences from "@/hooks/useGetUserPreferences";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Loader from "../experience/loader";

interface Props {
	size?: number;
}

export default function AvatarInitials({ size }: Props) {
	const { auth } = useAuthSession();
	const navigation = useNavigation<NavigationType>();
	const { data, isFetched } = useGetUserPreferences(auth?.user.id);

	const attributes = data?.data?.attributes;
	let backgroundColor: string;
	if (!isFetched) {
		return <Loader />;
	}

	if (!attributes?.avatarBackgroundColor) {
		backgroundColor = colorYellow;
	} else {
		backgroundColor = attributes.avatarBackgroundColor;
	}

	const getInitial = (value?: string) => {
		return value?.trim().charAt(0) || "";
	};

	const initials = () => {
		const firstLetter = getInitial(
			attributes?.user?.firstName ?? auth?.user?.firstName
		);
		const lastLetter = getInitial(
			attributes?.user?.lastName ?? auth?.user?.lastName
		);

		return (firstLetter + lastLetter).toUpperCase();
	};

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
			<Text style={styles.text}>{initials()}</Text>
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
