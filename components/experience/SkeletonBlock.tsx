import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type SkeletonBlockProps = {
	style?: StyleProp<ViewStyle>;
};

export default function SkeletonBlock({ style }: SkeletonBlockProps) {
	return <View style={[styles.block, style]} />;
}

const styles = StyleSheet.create({
	block: {
		backgroundColor: "#E6E6E6",
		borderRadius: 12,
	},
});
