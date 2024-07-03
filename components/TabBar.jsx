import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { primaryColor, primaryOrange } from "../constants/colors";

function TabBar({ state, descriptors, navigation }) {
	return (
		<View style={styles.tabbar}>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
						? options.title
						: route.name;

				if (["_sitemap", "+not-found"].includes(route.name)) return null;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: "tabLongPress",
						target: route.key,
					});
				};

				return (
					<TouchableOpacity
						key={route.name}
						style={styles.tabbarItem}
						accessibilityRole='button'
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarTestID}
						onPress={onPress}
						onLongPress={onLongPress}>
						<Text
							style={{
								color: isFocused ? primaryOrange : primaryColor,
								borderBottom: "2px solid #999",
							}}>
							{label}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	tabbar: {
		flexDirection: "row",
		justifyContent: "space-between",
		position: "absolute",
		bottom: 35,
		alignItems: "center",
		marginHorizontal: 10,
		paddingVertical: 15,
	},
	tabbarItem: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default TabBar;
