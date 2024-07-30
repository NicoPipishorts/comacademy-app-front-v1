import getUserIdFromToken from "@/helpers/getUserIdFromToken";
import { useEffect, useState } from "react";

const useUserId = () => {
	const [userId, setUserId] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchUserId = async () => {
			const id = await getUserIdFromToken();
			setUserId(id);
			setLoading(false);
		};

		fetchUserId();
	}, []);

	return { userId, loading };
};

export default useUserId;
