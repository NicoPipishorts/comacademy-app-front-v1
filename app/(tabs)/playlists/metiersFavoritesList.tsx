import CardFavoriteMetier from "@/components/cards/CardFavoriteMetier";
import FavoritesListScreen from "@/components/playlists/FavoritesListScreen";
import useAuthSession from "@/hooks/useAuthSession";
import { collectFavoriteItems, normalizeFavoriteRows } from "@/helpers/strapiEntity";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import { FavoriteMetier } from "@/types/metiers";

export default function MetiersFavoritesList() {
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteMetiers(auth?.user.id);

	const favoriteMetiers = collectFavoriteItems(
		normalizeFavoriteRows(favoriteResponse, "metiers")
	) as unknown as FavoriteMetier[];

	return (
		<FavoritesListScreen
			title='Les Metiers'
			emptyMessage="Tu n'a pas encore de metiers favorits d'ajouté."
			loading={!isFetched}
			isEmpty={favoriteMetiers.length === 0}>
			{favoriteMetiers.map((metier: FavoriteMetier) => (
				<CardFavoriteMetier
					key={metier.id}
					data={metier}
				/>
			))}
		</FavoritesListScreen>
	);
}
