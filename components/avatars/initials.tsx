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

	let backgroundColor: string;
	if (!isFetched) {
		return <Loader />;
	}

	if (!data?.data?.attributes.avatarBackgroundColor) {
		backgroundColor = colorYellow;
	} else {
		backgroundColor = data?.data?.attributes.avatarBackgroundColor;
	}

	const initials = () => {
		const firstLetter =
			data?.data?.attributes.user.firstName?.split("")[0] || "";
		const lastLetter = data?.data?.attributes.user.lastName?.split("")[0] || "";

		return firstLetter + lastLetter;
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
