import Loader from "@/components/experience/loader";
import { truncateString } from "@/helpers/truncateText";
import { NavigationType } from "@/types/general";
import { QuestionSolo } from "@/types/question";
import { useNavigation } from "expo-router";
import { Image } from "react-native";
import FavoriteCard, { favoriteCardStyles } from "./FavoriteCard";

interface Props {
	data: QuestionSolo;
	categoriesColors: { [key: number]: string };
	categoriesIcons: { [key: number]: string };
}

export default function CardFavoriteQuestion({
	data,
	categoriesColors,
	categoriesIcons,
}: Props) {
	const navigation = useNavigation<NavigationType>();

	if (!data) {
		return <Loader />;
	}

	return (
		<FavoriteCard
			title={truncateString(data.attributes.QUESTION, 70)}
			onPress={() =>
				navigation.navigate("favoriteQuestionDetails", {
					questionDocumentId: data.documentId,
					questionId: data.id,
				})
			}
			icons={data.attributes.CATEGORIE?.split(",").map((cat, index) => (
				<Image
					key={index}
					style={[
						favoriteCardStyles.icon,
						{ backgroundColor: `${categoriesColors}` },
					]}
					source={{
						uri: `${process.env.EXPO_PUBLIC_URL}${categoriesIcons[cat]}`,
					}}
				/>
			))}
		/>
	);
}
