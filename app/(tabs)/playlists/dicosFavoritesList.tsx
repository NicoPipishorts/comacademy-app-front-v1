import CardFavoriteDico from "@/components/cards/CardFavoriteDico";
import FavoritesListScreen from "@/components/playlists/FavoritesListScreen";
import useAuthSession from "@/hooks/useAuthSession";
import { collectFavoriteItems, normalizeFavoriteRows } from "@/helpers/strapiEntity";
import useGetFavoriteDicos from "@/hooks/useGetFavoriteDicos";
import { DicoFavoritesWord } from "@/types/dico";

export default function DicosFavoritesList() {
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteDicos(auth?.user.id);

	const favoriteWords = collectFavoriteItems(
		normalizeFavoriteRows(favoriteResponse, "words")
	) as unknown as DicoFavoritesWord[];

	return (
		<FavoritesListScreen
			title='Le Dico'
			emptyMessage="Tu n'a pas encore de mots favorits d'ajouté."
			loading={!isFetched}
			isEmpty={favoriteWords.length === 0}>
			{favoriteWords.map((word) => (
				<CardFavoriteDico
					key={word.id}
					data={word}
				/>
			))}
		</FavoritesListScreen>
	);
}
