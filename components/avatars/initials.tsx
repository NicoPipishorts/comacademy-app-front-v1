import { colorWhite, colorYellow } from "@/constants/colors";
import useGetUserPreferences from "@/hooks/useGetUserPreferences";
import useUserId from "@/hooks/useUserId";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Loader from "../experience/loader";

interface Props {
	size?: number;
}
export default function AvatarInitials({ size }: Props) {
	const { userId } = useUserId();
	const navigation = useNavigation<NavigationType>();
	const { data, isFetched } = useGetUserPreferences(userId);

	let backgroundColor: string;
	if (!isFetched) {
		return <Loader />;
	}

	if (data.data[0].attributes.avatarBackgroundColor === null) {
		backgroundColor = colorYellow;
	} else {
		backgroundColor = data.data[0].attributes.avatarBackgroundColor;
	}

	const initials = () => {
		const firstLetter =
			data?.data[0]?.attributes.user_id.data.attributes.firstName?.split("")[0];
		const lastLetter =
			data?.data[0]?.attributes.user_id.data.attributes.lastName?.split("")[0];

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
