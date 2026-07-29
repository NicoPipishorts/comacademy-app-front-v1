import CardFavoriteDico from "@/components/cards/CardFavoriteDico";
import FavoritesListScreen from "@/components/playlists/FavoritesListScreen";
import useAuthSession from "@/hooks/useAuthSession";
import useCategoryLookups from "@/hooks/useCategoryLookups";
import useGetFavoriteDicos from "@/hooks/useGetFavoriteDicos";

export default function DicosFavoritesList() {
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteDicos(auth?.user.id);
	const { categories, colorByStaticId, iconByStaticId } = useCategoryLookups();

	const favoriteWords =
		favoriteResponse?.data?.[0]?.attributes?.words?.data ?? [];

	return (
		<FavoritesListScreen
			title='Le Dico'
			emptyMessage="Tu n'a pas encore de mots favorits d'ajouté."
			loading={!categories || !isFetched}
			isEmpty={favoriteWords.length === 0}>
			{favoriteWords.map((word) => (
				<CardFavoriteDico
					key={word.id}
					data={word}
					categoriesColors={colorByStaticId[word.attributes.Categories]}
					categoriesIcons={iconByStaticId[word.attributes.Categories]}
				/>
			))}
		</FavoritesListScreen>
	);
}
