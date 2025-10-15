import { useUpdateUserPreferences } from "@/api/updateUserPreferences";
import {
	colorBlack,
	colorBlue,
	colorDarkGrey,
	colorGreen,
	colorGrey,
	colorOrange,
	colorPink,
	colorPurple,
	colorTurquoise,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserPreferences from "@/hooks/useGetUserPreferences";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Loader from "../experience/loader";
import ScreenHeaders from "../ScreenHeaders";

export const colorArray = [
	colorGreen,
	colorTurquoise,
	colorOrange,
	colorYellow,
	colorPink,
	colorPurple,
	colorBlue,
	colorGrey,
	colorDarkGrey,
	colorBlack,
];

export default function ChangeAvatar() {
	const { auth } = useAuthSession();

	const updatePreferences = useUpdateUserPreferences();
	const { data, isFetched } = useGetUserPreferences(auth?.user.id);

	if (!isFetched) {
		return <Loader />;
	}

	const onPress = (color: string) => {
		updatePreferences.mutate({
			avatarBackgroundColor: color,
			userId: data?.data.id,
		});
	};

	let userSelectedBgColor: string;

	if (!data?.data) {
		userSelectedBgColor = colorYellow;
	} else {
		userSelectedBgColor = data?.data.attributes.avatarBackgroundColor;
	}

	return (
		<>
			<ScreenHeaders content='Change ton Avatar' type='h2' />
			<Text>Choisis une couleur pour ton avatar</Text>
			<ScrollView
				horizontal
				contentContainerStyle={styles.colorsContainer}
				showsHorizontalScrollIndicator={false}>
				{colorArray.map((color, index) => {
					return (
						<View
							key={index}
							style={{
								justifyContent: "flex-start",
								marginRight: 10,
							}}>
							<Pressable
								style={[styles.colorContainer, { backgroundColor: color }]}
								onPress={() => onPress(color)}
							/>
							<View
								style={{
									marginTop: 6,
									marginLeft: 8,
									width: 26,
									minHeight: 4,
									borderRadius: 2,
									backgroundColor: userSelectedBgColor
										? userSelectedBgColor === color
											? colorBlack
											: primaryBackground
										: "",
								}}
							/>
						</View>
					);
				})}
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	colorsContainer: {
		paddingVertical: 10,
		marginBottom: 20,
	},
	colorContainer: {
		width: 40,
		height: 40,
		borderRadius: 40,
		borderColor: colorBlack,
		borderWidth: 1,
	},
});
