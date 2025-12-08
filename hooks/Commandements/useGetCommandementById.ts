// src/hooks/useGetCommandementById.ts
import useJwtToken from "@/hooks/useJwtToken";
import { SingleCommandementResponse } from "@/types/commandements";
import { useQuery } from "@tanstack/react-query";
import { buildApiUrl } from "@/helpers/api/buildApiUrl";

const fetchData = async (
	token: string,
	itemId: number
): Promise<SingleCommandementResponse> => {
	const url = buildApiUrl(`commandements/${itemId}?populate=cards`);
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`HTTP ${res.status}`, text);
		throw new Error(`HTTP ${res.status}`);
	}

	// Parse as unknown, then narrow
	const json: unknown = await res.json();

	// Minimal runtime guard for Strapi v4 single
	if (
		typeof json === "object" &&
		json !== null &&
		"data" in json &&
		typeof (json as any).data === "object" &&
		(json as any).data !== null
	) {
		return json as SingleCommandementResponse;
	}

	console.error("Unexpected response shape:", json);
	throw new Error("Invalid API response shape for SingleCommandementResponse");
};

const useGetCommandementById = (itemId: number) => {
	const { token } = useJwtToken();

	return useQuery<SingleCommandementResponse>({
		queryKey: ["CommandementsById", itemId],
		queryFn: () => fetchData(token, itemId),
		enabled: !!token && !!itemId,
	});
};

export default useGetCommandementById;
