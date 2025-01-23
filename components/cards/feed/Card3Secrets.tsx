import ThumbLikeButton from "@/components/buttons/thumbLike";
import {
	colorBlack,
	colorGrey,
	colorPurple,
	colorWhite,
} from "@/constants/colors";
import { FontSize14, FontSizeH1, FontSizeH3 } from "@/constants/fontsizes";
import { FeedItem } from "@/types/feed";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
}

export default function FeedCard3Secrets({ data, elementId }: Props) {
	const [title, text] = (data.payload.Key || "").split(/\r?\n/, 2);
	const router = useRouter();

	return (
		<View style={styles.cardContainer}>
			<Text style={styles.cardTitle}>{data.payload.Title} :</Text>
			<LinearGradient
				colors={["#CA87E9", "#F0ADAE"]}
				style={[styles.keyCardWrapper]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}>
				<View>
					<Text style={styles.keyCardTitle}>{title}</Text>
					<Text style={styles.keyCardText}>{text}</Text>
				</View>
				<TouchableOpacity
					onPress={() =>
						router.push(`/feed/Detail3Secrets?itemId=${data.elementId}`)
					}
					style={{
						position: "absolute",
						bottom: 20,
						right: 20,
						backgroundColor: colorGrey,
						paddingVertical: 8,
						paddingHorizontal: 25,
						borderRadius: 50,
					}}>
					<Text style={{ color: colorPurple }}>Voir +</Text>
				</TouchableOpacity>
				<View style={styles.cardNumberWrapper}>
					<Text style={styles.keyCardNum}>{data.payload.index}</Text>
				</View>
			</LinearGradient>
			<ThumbLikeButton elementId={elementId} userLiked={data.userLiked} />
		</View>
	);
}

const styles = StyleSheet.create({
	cardContainer: {
		marginLeft: 10,
		width: "84%",
		minHeight: 100,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		shadowColor: colorBlack,
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	keyCardWrapper: {
		position: "relative",
		justifyContent: "flex-start",
		backgroundColor: colorBlack,
		paddingVertical: 35,
		paddingHorizontal: 25,
		paddingBottom: 100,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
	},
	cardTitle: {
		color: colorBlack,
		fontSize: FontSizeH3,
		fontWeight: "bold",
		marginVertical: 10,
		marginLeft: 10,
		marginBottom: 20,
	},
	keyCardTitle: {
		color: colorWhite,
		fontSize: FontSizeH1,
		fontWeight: "bold",
		marginBottom: 15,
	},
	keyCardText: {
		color: colorWhite,
		fontSize: FontSize14,
		fontWeight: "bold",
	},
	cardNumberWrapper: {
		marginTop: 20,
		position: "absolute",
		bottom: 0,
		left: 30,
	},
	keyCardNum: {
		color: colorWhite,
		fontSize: 148,
		opacity: 0.2,
		fontWeight: "bold",
	},
});
