import CardFavoriteQuestion from "@/components/cards/CardFavoriteQuestion";
import FavoritesListScreen from "@/components/playlists/FavoritesListScreen";
import useAuthSession from "@/hooks/useAuthSession";
import useCategoryLookups from "@/hooks/useCategoryLookups";
import useGetFavoriteQuestions from "@/hooks/useGetFavoriteQuestions";

export default function QuestionsFavoritesList() {
	const insets = useSafeAreaInsets();
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteQuestions(auth?.user.id);
	const { categories, colorByStaticId, iconByStaticId } = useCategoryLookups();

	const favoriteQuestions =
		favoriteResponse?.data?.[0]?.attributes?.questions?.data ?? [];

	return (
		<FavoritesListScreen
			title='Questions'
			emptyMessage="Tu n'a pas encore de questions favorites d'ajouté."
			loading={!categories || !isFetched}
			isEmpty={favoriteQuestions.length === 0}>
			{favoriteQuestions.map((question) => (
				<CardFavoriteQuestion
					key={question.id}
					data={question}
					categoriesColors={colorByStaticId[question.attributes.CATEGORIE]}
					categoriesIcons={iconByStaticId[question.attributes.CATEGORIE]}
				/>
			))}
		</FavoritesListScreen>
	);
}
