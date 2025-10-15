import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSizeH4 } from "@/constants/fontsizes";
import React, {
	Dispatch,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Animated,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type Props = {
	activeTab: number;
	setActiveTab: Dispatch<SetStateAction<number>>;
	handlePress: (tabIndex: number) => boolean | number | void;
	values: {
		btn1: string;
		btn2: string;
	};
	disabledTabs?: number[];
};

const FloatingTabBar = ({
	activeTab,
	setActiveTab,
	handlePress,
	values,
	disabledTabs = [],
}: Props) => {
	const translateX = useRef(new Animated.Value(0)).current;
	const [btn1Width, setBtn1Width] = useState(0);
	const [btn2Width, setBtn2Width] = useState(0);

	// Animate the slider position and width when the active tab changes
	useEffect(() => {
		if (btn1Width > 0 && btn2Width > 0) {
			Animated.spring(translateX, {
				toValue: activeTab === 0 ? 0 : btn1Width,
				useNativeDriver: true,
			}).start();
		}
	}, [activeTab, btn1Width, btn2Width, translateX]);

	const handleTabPress = (tabIndex: number) => {
		if (disabledTabs.includes(tabIndex)) {
			handlePress(tabIndex);
			return;
		}

		const result = handlePress(tabIndex);
		if (result === false) {
			return;
		}

		if (typeof result === "number") {
			setActiveTab(result);
			return;
		}

		setActiveTab(tabIndex);
	};

	const onLayoutBtn1 = (event: any) => {
		const { width } = event.nativeEvent.layout;
		setBtn1Width(width);
	};

	const onLayoutBtn2 = (event: any) => {
		const { width } = event.nativeEvent.layout;
		setBtn2Width(width);
	};

	return (
		<View style={styles.container}>
			{/* Slider will always be rendered, but its width and position will be updated when the layout is ready */}
			<Animated.View
				style={[
					styles.slider,
					{
						width: activeTab === 0 ? btn1Width : btn2Width,
						transform: [{ translateX }],
					},
				]}
			/>
			<View onLayout={onLayoutBtn1}>
				<TouchableOpacity
					style={[
						styles.button,
						disabledTabs.includes(0) && styles.buttonDisabled,
					]}
					disabled={disabledTabs.includes(0)}
					onPress={() => handleTabPress(0)}>
					<Text
						style={activeTab === 0 ? styles.textActive : styles.textInactive}>
						{values.btn1}
					</Text>
				</TouchableOpacity>
			</View>
			<View onLayout={onLayoutBtn2}>
				<TouchableOpacity
					style={[
						styles.button,
						disabledTabs.includes(1) && styles.buttonDisabled,
					]}
					disabled={disabledTabs.includes(1)}
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
	buttonDisabled: {
		opacity: 0.4,
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
