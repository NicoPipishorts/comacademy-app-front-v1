import AvatarInitials from "@/components/avatars/initials";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import React from "react";
import {
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
} from "react-native";

type PageTitleAvatarHeaderProps = {
	title: string;
	showAvatar?: boolean;
	avatarSize?: number;
	onPressTitle?: () => void;
	containerStyle?: StyleProp<ViewStyle>;
	contentStyle?: StyleProp<ViewStyle>;
	titleStyle?: StyleProp<TextStyle>;
};

const PageTitleAvatarHeader = ({
	title,
	showAvatar = true,
	avatarSize = 68,
	onPressTitle,
	containerStyle,
	contentStyle,
	titleStyle,
}: PageTitleAvatarHeaderProps) => {
	return (
		<View style={[styles.container, containerStyle]}>
			<View style={[styles.content, contentStyle]}>
				{onPressTitle ? (
					<TouchableOpacity onPress={onPressTitle} activeOpacity={0.8}>
						<Text style={[styles.title, titleStyle]}>{title}</Text>
					</TouchableOpacity>
				) : (
					<Text style={[styles.title, titleStyle]}>{title}</Text>
				)}
				{showAvatar ? (
					<AvatarInitials
						size={avatarSize}
						showBorder
						showSoftShell
					/>
				) : (
					<View
						style={[
							styles.avatarPlaceholder,
							{ width: avatarSize, height: avatarSize },
						]}
					/>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		marginTop: 6,
		paddingBottom: 12,
	},
	content: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 14,
		paddingBottom: 14,
	},
	title: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	avatarPlaceholder: {
		opacity: 0,
	},
});

export default PageTitleAvatarHeader;
