import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../auth/AutContext"; // Make sure the path matches your structure
import { colorBlack, primaryBackground } from "../constants/colors";
import { FontSizeTabbar } from "../constants/fontsizes";

import accueil from "../assets/imgs/icons/accueil.png";
import dico from "../assets/imgs/icons/dico.png";
import le_jeu from "../assets/imgs/icons/le_jeu.png";
import metiers from "../assets/imgs/icons/metiers.png";
import playlists from "../assets/imgs/icons/playlists.png";

function TabBar({ state, descriptors, navigation }) {
	const { isAuthenticated } = useAuth(); // Using the authentication status

	const desiredOrder = ["index", "le_jeu", "playlists", "dico", "metiers"];
	const orderedRoutes = state.routes.slice().sort((a, b) => {
		return desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name);
	});

	const routeNameToOriginalIndex = {};
	state.routes.forEach((route, originalIndex) => {
		routeNameToOriginalIndex[route.name] = originalIndex;
	});

	return (
		<View style={styles.tabbarContainer}>
			<View style={styles.tabbar}>
				{orderedRoutes.map((route, index) => {
					const { options } = descriptors[route.key];
					const label = options.tabBarLabel ?? options.title ?? route.name;

					if (["_sitemap", "+not-found"].includes(route.name)) return null;
					const isFocused =
						state.index === routeNameToOriginalIndex[route.name];

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							// Check if the tab requires authentication
							if (
								["index", "le_jeu", "playlists", "dico", "metiers"].includes(
									route.name
								) &&
								!isAuthenticated
							) {
								// Optionally show an alert or redirect to login
								alert("You must be logged in to access this tab.");
							} else {
								navigation.navigate(route.name, route.params);
							}
						}
					};

					const onLongPress = () => {
						navigation.emit({
							type: "tabLongPress",
							target: route.key,
						});
					};

					const icons = { index: accueil, le_jeu, metiers, dico, playlists };

					return (
						<TouchableOpacity
							key={route.name}
							accessibilityRole='button'
							accessibilityState={isFocused ? { selected: true } : {}}
							accessibilityLabel={options.tabBarAccessibilityLabel}
							testID={options.tabBarTestID}
							onPress={onPress}
							onLongPress={onLongPress}
							style={styles.tabbarItem}>
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
		bottom: 0,
		width: "100%",
		alignItems: "center",
		backgroundColor: primaryBackground,
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
		fontSize: FontSizeTabbar,
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
		backgroundColor: colorBlack,
		borderRadius: 2,
		position: "absolute",
		bottom: 0,
	},
});

export default TabBar;
