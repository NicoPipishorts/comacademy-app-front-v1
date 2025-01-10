import { colorWhite, colorYellow } from "@/constants/colors";
import useGetUserPreferences from "@/hooks/useGetUserPreferences";
import useUserId from "@/hooks/useUserId";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Loader from "../experience/loader";

interface Props {
	firstName: string;
	lastName: string;
	size?: number;
}
export default function AvatarInitials({ firstName, lastName, size }: Props) {
	const { userId } = useUserId();
	const navigation = useNavigation<NavigationType>();
	const { data, isFetched } = useGetUserPreferences(userId);
	let backgroundColor: string;

	if (!isFetched) {
		return <Loader />;
	}

	if (data.data.length <= 0) {
		backgroundColor = colorYellow;
	} else {
		backgroundColor = data.data[0].attributes.avatarBackgroundColor;
	}

	const initials = () => {
		const firstLetter = firstName?.split("")[0];
		const lastLetter = lastName?.split("")[0];

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
		shadowOpacity: 0.15,
		shadowRadius: 10,
		elevation: 5,
	},
	text: {
		fontSize: 32,
		color: colorWhite,
		fontWeight: "bold",
	},
});
