import { colorDarkGrey, searchbarBackground } from "@/constants/colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import {
	StyleProp,
	StyleSheet,
	TextInput,
	TextStyle,
	View,
	ViewStyle,
} from "react-native";

type Props = {
	placeholder: string;
	onChangeText: (text: string) => void; // Update the type to accept a string argument
	containerStyle?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<TextStyle>;
};

const Searchbar = ({
	placeholder,
	onChangeText,
	containerStyle,
	inputStyle,
}: Props) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<FontAwesome5 name='search' size={20} color={colorDarkGrey} />
			<TextInput
				style={[styles.input, inputStyle]}
				placeholder={placeholder}
				clearButtonMode='always'
				onChangeText={onChangeText} // Pass the function directly
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
