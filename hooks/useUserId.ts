import getUserFromToken from "@/helpers/getUserFromToken";
import { useEffect, useState } from "react";

const useUserId = () => {
	const [userId, setUserId] = useState<number | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchUserId = async () => {
			const data = await getUserFromToken();
			setUserId(data.id);
			setLoading(false);
		};

		fetchUserId();
	}, []);

	return { userId, loading };
};

export default useUserId;
