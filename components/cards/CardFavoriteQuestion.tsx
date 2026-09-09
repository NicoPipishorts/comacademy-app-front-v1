import Loader from "@/components/experience/loader";
import SmallCategroieIcons from "@/components/icons/SmallCategroieIcons";
import { truncateString } from "@/helpers/truncateText";
import { NavigationType } from "@/types/general";
import { QuestionSolo } from "@/types/question";
import { useNavigation } from "expo-router";
import { View } from "react-native";
import FavoriteCard, { favoriteCardStyles } from "./FavoriteCard";

interface Props {
	data: QuestionSolo;
}

/** Category icons come from the bundled assets, like the detail screens. */
const renderCategoryIcons = (categories?: string | null) =>
	(categories ?? "")
		.split(",")
		.map((cat) => Number(cat.trim()))
		.filter((cat) => Number.isFinite(cat) && cat > 0)
		.map((cat) => (
			<View key={cat} style={favoriteCardStyles.icon}>
				<SmallCategroieIcons cats={cat} />
			</View>
		));

export default function CardFavoriteQuestion({ data }: Props) {
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
			icons={renderCategoryIcons(data.attributes.CATEGORIE)}
		/>
	);
}
