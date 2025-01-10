import { colorDarkGrey } from "@/constants/colors";
import { FontSize14, FontSizeH3 } from "@/constants/fontsizes";
import { formatTimeElapsed } from "@/helpers/formatTimeElapsed";
import { FeedAttributes } from "@/types/feed";
import { Image, Text, View } from "react-native";

interface Props {
	data: FeedAttributes;
}

export default function FeedCardHeader({ data }: Props) {
	const typeIcons: { [key: string]: any } = {
		secret: require("@/assets/imgs/icons/feed/secret.png"),
		dico: require("@/assets/imgs/icons/feed/dico.png"),
		citation: require("@/assets/imgs/icons/feed/citation.png"),
		metier: require("@/assets/imgs/icons/feed/metier.png"),
		question: require("@/assets/imgs/icons/feed/question.png"),
		commandement: require("@/assets/imgs/icons/feed/commandement.png"),
	};

	const typeTitre = () => {
		switch (data.type) {
			case "secret":
				return "3 secrets du succès";

			case "dico":
				return "Le dico";

			case "citation":
				return "Les citations";

			case "metier":
				return "Ton future metier?";

			case "question":
				return "Com'Academy : Le Jeu";

			case "commandement":
				return "Les 10 commandements";
		}
	};

	return (
		<View style={{ marginTop: 40 }}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "flex-start",
					alignItems: "flex-start",
					minWidth: "100%",
				}}>
				<Image
					source={typeIcons[data.type]}
					style={{ width: 48, height: 48, marginRight: 10 }}
					resizeMode='contain'
				/>
				<View
					style={{
						flexGrow: 1,
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						paddingRight: 10,
						paddingTop: 3,
					}}>
					<Text style={{ fontSize: FontSizeH3, fontWeight: "bold" }}>
						{typeTitre()}
					</Text>
					<Text
						style={{
							fontSize: FontSize14,
							fontWeight: "bold",
							color: colorDarkGrey,
						}}>
						{formatTimeElapsed(data.createdAt)}
					</Text>
				</View>
			</View>
		</View>
	);
}
