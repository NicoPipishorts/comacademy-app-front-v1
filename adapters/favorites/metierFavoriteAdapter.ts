import { useAddFavoritesMetierMutation } from "@/api/favoriteMetier";
import { FavoriteAdapter } from "@/components/buttons/favoriteToggleButton";
import {
	collectFavoriteIds,
	latestFavoriteRow,
	normalizeFavoriteRows,
} from "@/helpers/strapiEntity";
import { queryClient } from "@/hooks/reactQueryConfig";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";

/** Merge ALL ids across all rows (handles historical duplicates) */
const selectIds = (favoritesData: any | undefined): number[] =>
	collectFavoriteIds(normalizeFavoriteRows(favoritesData, "metiers"));

/** Latest row, addressed by documentId (Strapi 5 rejects numeric ids). */
const selectDataId = (favoritesData: any | undefined): string | number | null => {
	const latest = latestFavoriteRow(normalizeFavoriteRows(favoritesData, "metiers"));
	return latest ? latest.documentId ?? latest.id : null;
};

const metierFavoriteAdapter: FavoriteAdapter = {
	useFavorites: (userId) => useGetFavoriteMetiers(userId as number),
	selectIds,
	selectDataId,
	queryKey: (userId) => ["FavoriteMetiers", userId],

	useMutate: (onSuccess) => {
		const mutation = useAddFavoritesMetierMutation(() => {
			onSuccess();
		});

		return {
			mutate: ({
				userId,
				dataId,
				updatedIds,
				token,
			}: {
				userId?: number;
				dataId?: number | string;
				updatedIds: number[];
				token?: string;
			}) => {
				if (!token) return;

				// If we don't have a dataId, try to grab it from the cache (latest row).
				if (!dataId && userId) {
					const cached = queryClient.getQueryData<any>([
						"FavoriteMetiers",
						userId,
					]);
					const fromCache = selectDataId(cached);
					if (fromCache) dataId = fromCache;
				}

				const payload = dataId
					? { dataId, updatedFavoriteMetiers: updatedIds, token }
					: { userId, updatedFavoriteMetiers: updatedIds, token };

				mutation.mutate(payload as any, {
					onSuccess: () => {
						if (userId) {
							queryClient.invalidateQueries({
								queryKey: ["FavoriteMetiers", userId],
							});
						}
						onSuccess();
					},
				});
			},
			get isPending() {
				// @ts-ignore
				return mutation.isPending ?? mutation.isLoading ?? false;
			},
		};
	},
};

export default metierFavoriteAdapter;
