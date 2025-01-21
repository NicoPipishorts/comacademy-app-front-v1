import activity from "@/assets/imgs/icons/activity.png";
import dico from "@/assets/imgs/icons/dico.png";
import feed from "@/assets/imgs/icons/feed.png";
import le_jeu from "@/assets/imgs/icons/le_jeu.png";
import playlists from "@/assets/imgs/icons/playlists.png";
import { colorBlack, primaryBackground } from "@/constants/colors";
import { FontSizeTabbar } from "@/constants/fontsizes";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
	if (!state) {
		return null; // or a fallback UI
	}

	const icons: { [key: string]: any } = {
		activity: activity,
		leJeu: le_jeu,
		feed: feed,
		dico: dico,
		playlists: playlists,
	};

	const desiredOrder = ["activity", "leJeu", "feed", "playlists", "dico"];
	const orderedRoutes = state.routes
		.filter((route) => desiredOrder.includes(route.name))
		.sort(
			(a, b) => desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name)
		);

	// Define a custom label for each route if necessary
	const customLabels: { [key: string]: string } = {
		leJeu: "Le Jeu",
		feed: "Feed",
		dico: "Dico",
		playlists: "Playlists",
		activity: "Rubriques",
	};

	// Used to apply the BG or not to the tab bar.
	const currentRouteName = state.routes[state.index].name;

	return (
		<View style={styles.tabbarContainer}>
			<View style={styles.tabbar}>
				{orderedRoutes.map((route) => {
					const descriptor = descriptors[route.key];
					if (!descriptor) return null;

					const { options } = descriptor;

					// Logic to focus Accueil (index) if the current route is lesCitations or commandements
					const isFocused =
						state.index ===
							state.routes.findIndex((r) => r.name === route.name) ||
						(route.name === "activity" &&
							(currentRouteName === "lesCitations" ||
								currentRouteName === "commandements" ||
								currentRouteName === "secrets" ||
								currentRouteName === "petitesHistoires"));

					const label = customLabels[route.name] || route.name;

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						// Reset to Accueil (index) if the Accueil button is pressed
						if (route.name === "activity") {
							// Use reset to navigate back to the root screen
							navigation.reset({
								index: 0,
								routes: [{ name: "activity" }], // Ensure you go back to the root of the home stack
							});
						} else if (!isFocused && !event.defaultPrevented) {
							// Navigate normally to the selected tab
							navigation.navigate(route.name);
						}
					};

					return (
						<TouchableOpacity
							key={route.name}
							accessibilityRole='button'
							accessibilityState={isFocused ? { selected: true } : {}}
							testID={options.tabBarTestID}
							onPress={onPress}
							style={[styles.tabbarItem, styles.onTabBackground]}>
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
};

const styles = StyleSheet.create({
	tabbarContainer: {
		position: "absolute",
		paddingBottom: 6,
		bottom: 0,
		width: "100%",
		alignItems: "center",
		backgroundColor: primaryBackground,
	},
	onTabBackground: {
		paddingTop: 10,
		backgroundColor: primaryBackground,
	},
	tabbar: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "90%",
		paddingVertical: 5,
	},
	tabbarItem: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 22,
	},
	tabbarText: {
		fontSize: FontSizeTabbar,
		fontWeight: "bold",
	},
	tabIcons: {
		width: 28,
		height: 28,
		aspectRatio: 1,
		marginBottom: 5,
	},
	tabLabel: {
		borderBottomColor: "transparent",
	},
	focusedTab: {
		width: "50%",
		height: 4,
		backgroundColor: colorBlack,
		borderRadius: 2,
		position: "absolute",
		bottom: 10,
	},
});

export default TabBar;
