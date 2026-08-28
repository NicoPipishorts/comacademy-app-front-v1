import CardFavoriteCitation from "@/components/cards/CardFavoriteCitation";
import FavoritesListScreen from "@/components/playlists/FavoritesListScreen";
import useGetFavoriteCitationsFull from "@/hooks/Citations/useGetFavoriteCitationsFull";
import useAuthSession from "@/hooks/useAuthSession";
import useCategories from "@/hooks/useCategories";

export default function CitationsFavoritesList() {
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteCitationsFull(auth?.user.id);
	const { data: categories } = useCategories();

	const favorites = favoriteResponse?.data?.results?.data ?? [];

	return (
		<FavoritesListScreen
			title='Les Citations'
			emptyMessage="Tu n'a pas encore de mots favorits d'ajouté."
			loading={!categories || !isFetched}
			isEmpty={favorites.length === 0}>
			{favorites.map((word) => (
				<CardFavoriteCitation key={word.id} data={word} />
			))}
		</FavoritesListScreen>
	);
}
