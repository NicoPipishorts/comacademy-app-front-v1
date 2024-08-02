import accueil from "@/assets/imgs/icons/accueil.png";
import dico from "@/assets/imgs/icons/dico.png";
import le_jeu from "@/assets/imgs/icons/le_jeu.png";
import metiers from "@/assets/imgs/icons/metiers.png";
import playlists from "@/assets/imgs/icons/playlists.png";
import { colorBlack } from "@/constants/colors";
import { FontSizeTabbar } from "@/constants/fontsizes";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
	if (!state) {
		return null; // or a fallback UI
	}

	const icons: { [key: string]: any } = {
		index: accueil,
		leJeu: le_jeu,
		metiers: metiers,
		dico: dico,
		playlists: playlists,
	};

	const desiredOrder = ["index", "leJeu", "playlists", "dico", "metiers"];
	const orderedRoutes = state.routes
		.filter((route) => desiredOrder.includes(route.name))
		.sort(
			(a, b) => desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name)
		);

	// Define a custom label for each route if necessary
	const customLabels: { [key: string]: string } = {
		leJeu: "Le Jeu",
		metiers: "Métiers",
		dico: "Dictionnaire",
		playlists: "Playlists",
		index: "Accueil",
	};

	return (
		<View style={styles.tabbarContainer}>
			<View style={styles.tabbar}>
				{orderedRoutes.map((route) => {
					const descriptor = descriptors[route.key];
					if (!descriptor) return null;

					const { options } = descriptor;
					const isFocused =
						state.index ===
						state.routes.findIndex((r) => r.name === route.name);

					const label = customLabels[route.name] || route.name; // Use custom label or default to route name

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});
						if (!isFocused && !event.defaultPrevented) {
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
							style={styles.tabbarItem}>
							<Image
								source={icons[route.name] || accueil}
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
		bottom: 0,
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
		paddingBottom: 15,
		marginBottom: 10,
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
