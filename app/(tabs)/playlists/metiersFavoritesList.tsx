import CardFavoriteMetier from "@/components/cards/CardFavoriteMetier";
import FavoritesListScreen from "@/components/playlists/FavoritesListScreen";
import useAuthSession from "@/hooks/useAuthSession";
import useCategoryLookups from "@/hooks/useCategoryLookups";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import { FavoriteMetier } from "@/types/metiers";

export default function MetiersFavoritesList() {
	const { auth } = useAuthSession();

	const { data: favoriteResponse, isFetched } =
		useGetFavoriteMetiers(auth?.user.id);
	const { categories, colorByStaticId, iconByStaticId } = useCategoryLookups();

	const favoriteMetiers =
		favoriteResponse?.data?.[0]?.attributes?.metiers?.data ?? [];

	return (
		<FavoritesListScreen
			title='Les Metiers'
			emptyMessage="Tu n'a pas encore de metiers favorits d'ajouté."
			loading={!categories || !isFetched}
			isEmpty={favoriteMetiers.length === 0}>
			{favoriteMetiers.map((metier: FavoriteMetier) => (
				<CardFavoriteMetier
					key={metier.id}
					data={metier}
					categoriesColors={colorByStaticId[metier.attributes.CATEGORIE]}
					categoriesIcons={iconByStaticId[metier.attributes.CATEGORIE]}
				/>
			))}
		</FavoritesListScreen>
	);
}
