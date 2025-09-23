import { useAddFavoriteDico } from "@/api/favoriteDico";
import { FavoriteAdapter } from "@/components/buttons/favoriteToggleButton";
import useGetFavoriteDicos from "@/hooks/useGetFavoriteDicos";

const selectIds = (favoritesData: any | undefined): number[] => {
	const first = favoritesData?.data?.[0];
	if (!first) return [];
	return (
		first.attributes?.words?.data?.map((it: { id: number }) => it.id) ?? []
	);
};

const selectDataId = (favoritesData: any | undefined): number | null => {
	return favoritesData?.data?.[0]?.id ?? null;
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
