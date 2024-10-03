import { ImageStyle, StyleSheet, View } from "react-native";

type SmallCategroieIconsNoImageProps = {
	cats: number;
};

const SmallCategroieIconsNoImage: React.FC<SmallCategroieIconsNoImageProps> = ({
	cats,
}) => {
	const ShowProperIcon = () => {
		switch (cats) {
			case 1:
				return (
					<View
						style={[
							{ backgroundColor: "#FFBC09" },
							styles.catIcons as ImageStyle,
						]}
					/>
				);
			case 2:
				return (
					<View
						style={[
							{ backgroundColor: "#EE7424" },
							styles.catIcons as ImageStyle,
						]}
					/>
				);
			case 3:
				return (
					<View
						style={[
							{ backgroundColor: "#1B75BB" },
							styles.catIcons as ImageStyle,
						]}
					/>
				);
			case 4:
				return (
					<View
						style={[
							{ backgroundColor: "#CC398C" },
							styles.catIcons as ImageStyle,
						]}
					/>
				);
			case 5:
				return (
					<View
						style={[
							{ backgroundColor: "#4AADA8" },
							styles.catIcons as ImageStyle,
						]}
					/>
				);
			case 6:
				return (
					<View
						style={[
							{ backgroundColor: "#8BC63F" },
							styles.catIcons as ImageStyle,
						]}
					/>
				);
			default:
				return null;
		}
	};

	return <>{ShowProperIcon()}</>;
};

const styles = StyleSheet.create({
	containerIcons: {
		flexDirection: "row",
	},
	catIcons: {
		width: 20,
		height: 20,
		borderRadius: 15,
		aspectRatio: 1,
		padding: 3,
	},
});

export default SmallCategroieIconsNoImage;
