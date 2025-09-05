import { useAddFavoritesMetierMutation } from "@/api/favoriteMetier";
import { FavoriteAdapter } from "@/components/buttons/favoriteToggleButton";
import { queryClient } from "@/hooks/reactQueryConfig";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";

/** Merge ALL ids across all rows (handles historical duplicates) */
const selectIds = (favoritesData: any | undefined): number[] => {
	const rows = favoritesData?.data ?? [];
	const set = new Set<number>();
	for (const row of rows) {
		const items = row?.attributes?.metiers?.data ?? [];
		for (const it of items) {
			const n = Number(it?.id);
			if (Number.isFinite(n)) set.add(n);
		}
	}
	return Array.from(set);
};

/** Prefer the latest row (highest numeric id) as the container to update */
const selectDataId = (favoritesData: any | undefined): number | null => {
	const rows = favoritesData?.data ?? [];
	if (!rows.length) return null;
	const latest = rows.reduce((acc: any, r: any) => {
		const rid = Number(r?.id);
		const aid = Number(acc?.id);
		return !acc || (Number.isFinite(rid) && rid > aid) ? r : acc;
	}, null);
	const n = Number(latest?.id);
	return Number.isFinite(n) ? n : null;
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
				dataId?: number;
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
