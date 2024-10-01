import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSizeH4 } from "@/constants/fontsizes";
import React, { useEffect, useRef, useState } from "react";
import {
	Animated,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type Props = {
	selectedTab?: boolean;
	handlePress: (tabIndex: number) => void;
	values: {
		btn1: string;
		btn2: string;
	};
};

const FloatingTabBar = ({
	selectedTab = false,
	handlePress,
	values,
}: Props) => {
	const translateX = useRef(new Animated.Value(0)).current;
	const [activeTab, setActiveTab] = useState(selectedTab ? 1 : 0);
	const [btn1Width, setBtn1Width] = useState(0);
	const [btn2Width, setBtn2Width] = useState(0);

	const btn1Ref = useRef(null);
	const btn2Ref = useRef(null);

	// Animate the slider position and width when the active tab changes
	useEffect(() => {
		Animated.spring(translateX, {
			toValue: activeTab === 0 ? 0 : btn1Width, // Slide the slider based on the button widths
			useNativeDriver: true,
		}).start();
	}, [activeTab, btn1Width, btn2Width, translateX]);

	const handleTabPress = (tabIndex: number) => {
		setActiveTab(tabIndex);
		handlePress(tabIndex); // Call parent function to handle tab change logic
	};

	// Measure the button widths dynamically
	useEffect(() => {
		if (btn1Ref.current && btn2Ref.current) {
			btn1Ref.current.measure((x, y, width) => {
				setBtn1Width(width);
			});
			btn2Ref.current.measure((x, y, width) => {
				setBtn2Width(width);
			});
		}
	}, []);

	console.log(activeTab);

	return (
		<View style={styles.container}>
			<Animated.View
				style={[
					styles.slider,
					{
						width: activeTab === 0 ? btn1Width : btn2Width, // Adjust slider width based on active tab
						transform: [{ translateX }],
					},
				]}
			/>
			<View ref={btn1Ref}>
				<TouchableOpacity
					style={styles.button}
					onPress={() => handleTabPress(0)}>
					<Text
						style={activeTab === 0 ? styles.textActive : styles.textInactive}>
						{values.btn1}
					</Text>
				</TouchableOpacity>
			</View>
			<View ref={btn2Ref}>
				<TouchableOpacity
					style={styles.button}
					onPress={() => handleTabPress(1)}>
					<Text
						style={activeTab === 1 ? styles.textActive : styles.textInactive}>
						{values.btn2}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: primaryBackground,
		flexDirection: "row",
		borderRadius: 50,
		padding: 7,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.35,
		shadowRadius: 10,
		elevation: 5,
		position: "relative",
		alignSelf: "center",
	},
	button: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		alignItems: "center",
		zIndex: 2,
	},
	slider: {
		position: "absolute",
		height: "100%",
		backgroundColor: colorBlack,
		borderRadius: 50,
		top: 7,
		left: 7,
		zIndex: -1,
	},
	textActive: {
		color: colorWhite,
		fontSize: FontSizeH4,
		fontWeight: "bold",
	},
	textInactive: {
		color: colorBlack,
		fontSize: FontSizeH4,
		fontWeight: "bold",
	},
});

export default FloatingTabBar;
