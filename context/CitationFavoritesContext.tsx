// src/contexts/CitationFavoritesContext.tsx
import { useCreateOrGetFavoriteCitation } from "@/api/citations/useCreateOrGetFavoriteCitation";
import { useRemoveFavoriteCitation } from "@/api/citations/useRemoveFavoriteCitation";
import useGetFavoriteCitations from "@/hooks/Citations/useGetFavoriteCitations";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useMemo } from "react";

type Ctx = {
	ids: Set<number>;
	isFavorite: (id: number) => boolean;
	toggle: (id: number) => void;
	isMutating: boolean;
};

const CitationFavoritesContext = createContext<Ctx | undefined>(undefined);

export const CitationFavoritesProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const qc = useQueryClient();

	const { data } = useGetFavoriteCitations(auth?.user.id);
	const idsArray: number[] = (data?.data?.results?.data ?? []).map(
		(x: { id: number }) => Number(x.id)
	);
	const ids = useMemo(() => new Set(idsArray), [idsArray]);

	const addMut = useCreateOrGetFavoriteCitation(() => {
		qc.invalidateQueries({ queryKey: ["CitationsFavorites", auth?.user.id] });
	});
	const delMut = useRemoveFavoriteCitation(() => {
		qc.invalidateQueries({ queryKey: ["CitationsFavorites", auth?.user.id] });
	});

	const isMutating = !!(addMut.isPending || delMut.isPending);

	const isFavorite = useCallback((id: number) => ids.has(id), [ids]);
	const toggle = useCallback(
		(id: number) => {
			if (!auth?.user.id || !token) return;
			if (ids.has(id)) {
				delMut.mutate({ userId: auth?.user.id, citationId: id, token });
			} else {
				addMut.mutate({ userId: auth?.user.id, citationId: id, token });
			}
		},
		[ids, auth?.user.id, token, addMut, delMut]
	);

	const value = useMemo<Ctx>(
		() => ({ ids, isFavorite, toggle, isMutating }),
		[ids, isFavorite, toggle, isMutating]
	);
	return (
		<CitationFavoritesContext.Provider value={value}>
			{children}
		</CitationFavoritesContext.Provider>
	);
};

export const useCitationFavorites = () => {
	const ctx = useContext(CitationFavoritesContext);
	if (!ctx)
		throw new Error(
			"useCitationFavorites must be used within CitationFavoritesProvider"
		);
	return ctx;
};
