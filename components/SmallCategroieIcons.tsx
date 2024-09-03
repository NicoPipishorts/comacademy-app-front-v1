import Cat1 from "@/assets/imgs/icons/cat_1.png";
import Cat2 from "@/assets/imgs/icons/cat_2.png";
import Cat3 from "@/assets/imgs/icons/cat_3.png";
import Cat4 from "@/assets/imgs/icons/cat_4.png";
import Cat5 from "@/assets/imgs/icons/cat_5.png";
import Cat6 from "@/assets/imgs/icons/cat_6.png";
import { Image, ImageStyle, StyleSheet } from "react-native";

type SmallCategroieIconsProps = {
	cats: number;
};

const SmallCategroieIcons: React.FC<SmallCategroieIconsProps> = ({ cats }) => {
	const ShowProperIcon = () => {
		switch (cats) {
			case 1:
				return (
					<Image
						source={Cat1}
						style={[
							{ backgroundColor: "#FFBC09" },
							styles.catIcons as ImageStyle,
						]}
						resizeMode='contain'
					/>
				);
			case 2:
				return (
					<Image
						source={Cat2}
						style={[
							{ backgroundColor: "#EE7424" },
							styles.catIcons as ImageStyle,
						]}
						resizeMode='contain'
					/>
				);
			case 3:
				return (
					<Image
						source={Cat3}
						style={[
							{ backgroundColor: "#1B75BB" },
							styles.catIcons as ImageStyle,
						]}
						resizeMode='contain'
					/>
				);
			case 4:
				return (
					<Image
						source={Cat4}
						style={[
							{ backgroundColor: "#CC398C" },
							styles.catIcons as ImageStyle,
						]}
						resizeMode='contain'
					/>
				);
			case 5:
				return (
					<Image
						source={Cat5}
						style={[
							{ backgroundColor: "#4AADA8" },
							styles.catIcons as ImageStyle,
						]}
						resizeMode='contain'
					/>
				);
			case 6:
				return (
					<Image
						source={Cat6}
						style={[
							{ backgroundColor: "#8BC63F" },
							styles.catIcons as ImageStyle,
						]}
						resizeMode='contain'
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
		marginBottom: 50,
	},
	catIcons: {
		width: 30,
		height: 30,
		borderRadius: 15,
		aspectRatio: 1,
		marginRight: 8,
		padding: 3,
	},
});

export default SmallCategroieIcons;
