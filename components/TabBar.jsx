import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { primaryColor } from "../constants/colors";

// Custom icons
import accueil from "../assets/imgs/icons/accueil.png";
import dico from "../assets/imgs/icons/dico.png";
import le_jeu from "../assets/imgs/icons/le_jeu.png";
import metiers from "../assets/imgs/icons/metiers.png";
import playlists from "../assets/imgs/icons/playlists.png";

function TabBar({ state, descriptors, navigation }) {
	// Define the desired tab order
	const desiredOrder = ["index", "le_jeu", "metiers", "dico", "playlists"];

	// Reorder the state.routes array based on the desired order
	const orderedRoutes = state.routes.slice().sort((a, b) => {
		return desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name);
	});

	// Create a mapping of route names to their original indices
	const routeNameToOriginalIndex = {};
	state.routes.forEach((route, originalIndex) => {
		routeNameToOriginalIndex[route.name] = originalIndex;
	});

	return (
		<View style={styles.tabbarContainer}>
			<View style={styles.tabbar}>
				{orderedRoutes.map((route, index) => {
					const { options } = descriptors[route.key];
					const label =
						options.tabBarLabel !== undefined
							? options.tabBarLabel
							: options.title !== undefined
							? options.title
							: route.name;

					if (["_sitemap", "+not-found"].includes(route.name)) return null;

					// Determine if this tab is focused by comparing with the original index
					const isFocused =
						state.index === routeNameToOriginalIndex[route.name];

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

					const icons = {
						index: accueil,
						le_jeu,
						metiers,
						dico,
						playlists,
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
							<Image
								source={icons[route.name]}
								style={styles.tabIcons}
								resizeMode='contain'
							/>
							<Text style={styles.tabbarText}>{label}</Text>
							{isFocused && <View style={styles.focusedTab} />}
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	tabbarContainer: {
		position: "absolute",
		bottom: 15,
		width: "100%",
		alignItems: "center",
	},
	tabbar: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "90%",
		paddingVertical: 15,
	},
	tabbarItem: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 20,
	},
	tabbarText: {
		fontSize: 11,
		fontWeight: "bold",
	},
	tabIcons: {
		width: 28,
		height: 28,
		aspectRatio: 1,
		marginBottom: 10,
	},
	tabLabel: {
		borderBottomWidth: 4,
		borderBottomColor: "transparent",
	},
	focusedTab: {
		width: "50%",
		height: 4,
		backgroundColor: primaryColor,
		borderRadius: 2,
		position: "absolute",
		bottom: 0,
	},
});

export default TabBar;
