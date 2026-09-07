import { useAddFavoriteDico } from "@/api/favoriteDico";
import { FavoriteAdapter } from "@/components/buttons/favoriteToggleButton";
import {
	collectFavoriteIds,
	latestFavoriteRow,
	normalizeFavoriteRows,
} from "@/helpers/strapiEntity";
import useGetFavoriteDicos from "@/hooks/useGetFavoriteDicos";

/** Merge ids across every row (users can own historical duplicates). */
const selectIds = (favoritesData: any | undefined): number[] =>
	collectFavoriteIds(normalizeFavoriteRows(favoritesData, "words"));

/** Latest row, addressed by documentId (Strapi 5 rejects numeric ids). */
const selectDataId = (favoritesData: any | undefined): string | number | null => {
	const latest = latestFavoriteRow(normalizeFavoriteRows(favoritesData, "words"));
	return latest ? latest.documentId ?? latest.id : null;
};

const dicoFavoriteAdapter: FavoriteAdapter = {
	useFavorites: (userId) => useGetFavoriteDicos(userId),
	selectIds,
	selectDataId,
	queryKey: (userId) => ["DicoFavorites", userId],
	useMutate: (onSuccess) => {
		const mutation = useAddFavoriteDico(onSuccess);
		return {
			mutate: ({ userId, dataId, updatedIds, token }) => {
				if (dataId) {
					mutation.mutate({ dataId, updatedFavoriteDicos: updatedIds, token });
				} else {
					mutation.mutate({ userId, updatedFavoriteDicos: updatedIds, token });
				}
			},
			get isPending() {
				return mutation.isPending;
			},
		};
	},
};

export default dicoFavoriteAdapter;
