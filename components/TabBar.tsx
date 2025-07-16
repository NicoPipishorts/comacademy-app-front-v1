// File: src/components/CustomTabBar.tsx
import activityIcon from "@/assets/imgs/icons/activity.png";
import dicoIcon from "@/assets/imgs/icons/dico.png";
import feedIcon from "@/assets/imgs/icons/feed.png";
import leJeuIcon from "@/assets/imgs/icons/le_jeu.png";
import playlistsIcon from "@/assets/imgs/icons/playlists.png";
import { colorBlack, primaryBackground } from "@/constants/colors";
import { FontSizeTabbar } from "@/constants/fontsizes";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Href } from 'expo-router';
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const icons: Record<string, any> = {
	activity: activityIcon,
	leJeu: leJeuIcon,
	feed: feedIcon,
	playlists: playlistsIcon,
	dico: dicoIcon,
};

const labels: Record<string, string> = {
	activity: "Rubriques",
	leJeu: "Le Jeu",
	feed: "Feed",
	playlists: "Playlists",
	dico: "Dico",
};

const desiredOrder = ["activity", "leJeu", "feed", "playlists", "dico"];

export default function CustomTabBar({
	state,
	descriptors,
	navigation,
}: BottomTabBarProps) {
	const router = useRouter();
	const currentRouteName = state.routes[state.index]?.name;

	// order and filter
	const ordered = state.routes
		.filter((r) => desiredOrder.includes(r.name))
		.sort(
			(a, b) => desiredOrder.indexOf(a.name) - desiredOrder.indexOf(b.name)
		);

	return (
		<View style={styles.container}>
			<View style={styles.tabbar}>
				{ordered.map((route) => {
					const descriptor = descriptors[route.key];
					if (!descriptor) return null;

					const isFocused =
						state.index ===
						state.routes.findIndex((r) => r.name === route.name);
					const icon = icons[route.name]!;
					const label = labels[route.name] || route.name;

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						// 1) if the event has been prevented, abort
						if (event.defaultPrevented) {
							return;
						}

						// 2) if already focused, do nothing
						if (isFocused) {
							return;
						}

						// 3) navigate or replace depending on tab
						if (route.name === "activity") {
							router.replace("/activity");
						} else if (route.name === "leJeu") {
							router.push('/leJeu' as Href<string>);
						} else {
							router.push(`/${route.name}` as Href<string>);
						}
					};

					return (
						<TouchableOpacity
							key={route.name}
							accessibilityRole='button'
							accessibilityState={isFocused ? { selected: true } : {}}
							onPress={onPress}
							style={styles.tabItem}>
							<Image source={icon} style={styles.icon} resizeMode='contain' />
							<Text style={styles.label}>{label}</Text>
							{isFocused && <View style={styles.indicator} />}
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 0,
		width: "100%",
		backgroundColor: primaryBackground,
		paddingBottom: 6,
		alignItems: "center",
	},
	tabbar: {
		flexDirection: "row",
		width: "90%",
		justifyContent: "space-between",
		paddingVertical: 5,
	},
	tabItem: {
		flex: 1,
		alignItems: "center",
		paddingTop: 10,
		paddingBottom: 22,
	},
	icon: {
		width: 28,
		height: 28,
		marginBottom: 5,
	},
	label: {
		fontSize: FontSizeTabbar,
		fontWeight: "bold",
	},
	indicator: {
		position: "absolute",
		bottom: 10,
		width: "50%",
		height: 4,
		backgroundColor: colorBlack,
		borderRadius: 2,
	},
});
