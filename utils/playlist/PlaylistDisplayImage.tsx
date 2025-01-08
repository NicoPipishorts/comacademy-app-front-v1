import Image1 from "@/assets/imgs/icons/playlists/1.png";
import Image10 from "@/assets/imgs/icons/playlists/10.png";
import Image11 from "@/assets/imgs/icons/playlists/11.png";
import Image12 from "@/assets/imgs/icons/playlists/12.png";
import Image13 from "@/assets/imgs/icons/playlists/13.png";
import Image14 from "@/assets/imgs/icons/playlists/14.png";
import Image2 from "@/assets/imgs/icons/playlists/2.png";
import Image3 from "@/assets/imgs/icons/playlists/3.png";
import Image4 from "@/assets/imgs/icons/playlists/4.png";
import Image5 from "@/assets/imgs/icons/playlists/5.png";
import Image6 from "@/assets/imgs/icons/playlists/6.png";
import Image7 from "@/assets/imgs/icons/playlists/7.png";
import Image8 from "@/assets/imgs/icons/playlists/8.png";
import Image9 from "@/assets/imgs/icons/playlists/9.png";

import { colorWhite } from "@/constants/colors";
import { FontSizeH1 } from "@/constants/fontsizes";
import { Image, StyleSheet, Text, View } from "react-native";
import { getInitials } from "../getInitials";

interface Props {
	image?: string;
	title?: string;
	width: number;
	height: number;
}

export default function PlaylistDisplayImage(props: Props) {
	const { image, width, height, title } = props;

	const playlistPatternImages = (
		image: string,
		width: number,
		height: number
	) => {
		const imageArray = [
			{ name: "1", image: Image1 },
			{ name: "2", image: Image2 },
			{ name: "3", image: Image3 },
			{ name: "4", image: Image4 },
			{ name: "5", image: Image5 },
			{ name: "6", image: Image6 },
			{ name: "7", image: Image7 },
			{ name: "8", image: Image8 },
			{ name: "9", image: Image9 },
			{ name: "10", image: Image10 },
			{ name: "11", image: Image11 },
			{ name: "12", image: Image12 },
			{ name: "13", image: Image13 },
			{ name: "14", image: Image14 },
		];

		const finalImage = imageArray.find((img) => img.name === image);
		return (
			<Image
				source={finalImage.image}
				style={[styles.image, { width, height }]}
			/>
		);
	};

	const renderImage = () => {
		if (image.split("")[0] !== "#") {
			return playlistPatternImages(image, width, height);
		} else {
			return (
				<View
					style={[
						styles.image,
						{ backgroundColor: `${image}`, width, height },
					]}>
					<Text style={styles.imageText}>{getInitials(title)}</Text>
				</View>
			);
		}
	};

	return renderImage();
}

const styles = StyleSheet.create({
	image: {
		alignItems: "center",
		justifyContent: "center",
		marginRight: 15,
		borderRadius: 10,
	},
	imageText: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		color: colorWhite,
	},
});
