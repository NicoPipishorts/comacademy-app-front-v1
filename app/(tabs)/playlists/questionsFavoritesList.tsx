import CardFavoriteQuestion from "@/components/cards/CardFavoriteQuestion";
import FavoritesListScreen from "@/components/playlists/FavoritesListScreen";
import useAuthSession from "@/hooks/useAuthSession";
import { collectFavoriteItems, normalizeFavoriteRows } from "@/helpers/strapiEntity";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";
import { QuestionSolo } from "@/types/question";

export default function QuestionsFavoritesList() {
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteQuestions(auth?.user.id);

	const favoriteQuestions = collectFavoriteItems(
		normalizeFavoriteRows(favoriteResponse, "questions")
	) as unknown as QuestionSolo[];

	return (
		<FavoritesListScreen
			title='Questions'
			emptyMessage="Tu n'a pas encore de questions favorites d'ajouté."
			loading={!isFetched}
			isEmpty={favoriteQuestions.length === 0}>
			{favoriteQuestions.map((question) => (
				<CardFavoriteQuestion
					key={question.id}
					data={question}
				/>
			))}
		</FavoritesListScreen>
	);
}
