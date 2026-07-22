import navFeedIcon from "@/assets/imgs/icons/nav_feed.svg";
import navJeuIcon from "@/assets/imgs/icons/nav_jeu.svg";
import navParcoursIcon from "@/assets/imgs/icons/nav_parcours.svg";
import navProfileIcon from "@/assets/imgs/icons/nav_profile.svg";
import navRubriquesIcon from "@/assets/imgs/icons/nav_rubriques.svg";
import { colorBlack, primaryBackground } from "@/constants/colors";
import { FontSizeTabbar } from "@/constants/fontsizes";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useAssets } from "expo-asset";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

const tabItems = [
	{
		routeName: "activity",
		label: "Acceuil",
		icon: navRubriquesIcon,
		iconWidth: 32,
		iconHeight: 26,
	},
	{
		routeName: "leJeu",
		label: "Jeu",
		icon: navJeuIcon,
		iconWidth: 31,
		iconHeight: 30,
	},
	{
		routeName: "parcours",
		label: "Parcours",
		icon: navParcoursIcon,
		iconWidth: 22,
		iconHeight: 29,
	},
	{
		routeName: "feed",
		label: "Feed",
		icon: navFeedIcon,
		iconWidth: 23,
		iconHeight: 24,
	},
	{
		routeName: "dashboard",
		label: "Moi",
		icon: navProfileIcon,
		iconWidth: 22,
		iconHeight: 21,
	},
] as const;

function NavIcon({
	source,
	width,
	height,
}: {
	source: any;
	width: number;
	height: number;
}) {
	const [assets] = useAssets([source]);
	const iconUri = assets?.[0]?.localUri ?? assets?.[0]?.uri;

	if (!iconUri) {
		return null;
	}

	return <SvgUri uri={iconUri} width={width} height={height} />;
}

export default function CustomTabBar({
	state,
	descriptors,
	navigation,
}: BottomTabBarProps) {
	const insets = useSafeAreaInsets();

	const routeByName = new Map(state.routes.map((route) => [route.name, route]));
	const activeRouteName = state.routes[state.index]?.name;

	const findTabRoute = (tabRouteName: string) =>
		routeByName.get(tabRouteName) ??
		routeByName.get(`${tabRouteName}/index`) ??
		state.routes.find(
			(route) =>
				route.name === tabRouteName ||
				route.name.startsWith(`${tabRouteName}/`),
		);

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 6 }]}>
			<View style={styles.tabbar}>
				{tabItems.map((tab) => {
					const route = findTabRoute(tab.routeName);
					if (!route) return null;

					const descriptor = descriptors[route.key];
					if (!descriptor) return null;

					const isFocused =
						activeRouteName === route.name ||
						(tab.routeName === "parcours" &&
							(activeRouteName === "parcours" ||
								activeRouteName?.startsWith("parcours/"))) ||
						(tab.routeName === "dashboard" &&
							(activeRouteName === "dashboard" ||
								activeRouteName?.startsWith("dashboard/") ||
								activeRouteName === "playlists" ||
								activeRouteName?.startsWith("playlists/") ||
								activeRouteName === "bonus" ||
								activeRouteName?.startsWith("bonus/")));

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (event.defaultPrevented) {
							return;
						}

						if (isFocused) {
							return;
						}

						navigation.navigate(route.name);
					};

					return (
						<TouchableOpacity
							key={tab.routeName}
							accessibilityRole='button'
							accessibilityState={isFocused ? { selected: true } : {}}
							onPress={onPress}
							style={styles.tabItem}>
							<View
								style={[
									styles.iconContainer,
									isFocused && styles.iconContainerFocused,
								]}>
								<NavIcon
									source={tab.icon}
									width={tab.iconWidth}
									height={tab.iconHeight}
								/>
							</View>
							<Text style={styles.label}>{tab.label}</Text>
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
		alignItems: "center",
	},
	tabbar: {
		flexDirection: "row",
		width: "100%",
		paddingHorizontal: 12,
		paddingTop: 3,
		paddingBottom: 2,
	},
	tabItem: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 8,
		marginHorizontal: 2,
	},
	iconContainer: {
		height: 42,
		minWidth: 72,
		paddingHorizontal: 14,
		borderRadius: 21,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 6,
	},
	iconContainerFocused: {
		backgroundColor: "#D8D8D8",
	},
	label: {
		fontSize: FontSizeTabbar,
		fontWeight: "700",
		color: colorBlack,
	},
});
