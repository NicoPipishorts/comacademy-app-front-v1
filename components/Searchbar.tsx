import { colorDarkGrey, searchbarBackground } from "@/constants/colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

type Props = {
	placeholder: string;
};

const Searchbar = ({ placeholder }: Props) => {
	return (
		<View style={styles.container}>
			<FontAwesome5 name='search' size={20} color={colorDarkGrey} />
			<TextInput
				style={styles.input}
				placeholder={placeholder}
				clearButtonMode='always'
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		backgroundColor: searchbarBackground,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 10,
		alignItems: "center",
		elevation: 3,
	},
	input: {
		flex: 1,
		fontSize: 16,
		paddingLeft: 10,
		paddingVertical: 5,
	},
});

export default Searchbar;
