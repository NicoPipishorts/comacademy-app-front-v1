import { useCreateOrGetFavoriteCitation } from "@/api/citations/useCreateOrGetFavoriteCitation";
import { useRemoveFavoriteCitation } from "@/api/citations/useRemoveFavoriteCitation";
import { FavoriteAdapter } from "@/components/buttons/favoriteToggleButton";
import useGetFavoriteCitations from "@/hooks/Citations/useGetFavoriteCitations";

const selectIds = (data: any | undefined): number[] => {
	const items = data?.data?.results?.data ?? [];
	return items.map((it: { id: number }) => it.id);
};

// Not used for pair-based mode
const selectDataId = (_data: any | undefined): number | null => null;

const citationFavoriteAdapter: FavoriteAdapter = {
	useFavorites: (userId) => useGetFavoriteCitations(userId as number),
	selectIds,
	selectDataId,
	queryKey: (userId) => ["CitationsFavorites", userId],
	useMutate: (onSuccess) => {
		const addMut = useCreateOrGetFavoriteCitation(() => onSuccess());
		const delMut = useRemoveFavoriteCitation(() => onSuccess());

		return {
			mutate: ({
				userId,
				updatedIds,
				token,
				___internalTargetId,
			}: {
				userId?: number;
				updatedIds: number[];
				token?: string;
				___internalTargetId?: number; // <-- include it here
			}) => {
				const targetId = ___internalTargetId;
				if (!userId || !token || !targetId) return;

				const nextSet = new Set(updatedIds);
				if (nextSet.has(targetId)) {
					// ADD
					addMut.mutate({ userId, citationId: targetId, token });
				} else {
					// REMOVE
					delMut.mutate({ userId, citationId: targetId, token });
				}
			},
			get isPending() {
				return addMut.isPending || delMut.isPending;
			},
		};
	},
};

export default citationFavoriteAdapter;
