import { UseAuth } from "@/auth/AuthContext";

const useJwtToken = () => {
	const { token, loading } = UseAuth();
	return { token, loading };
};

export default useJwtToken;
