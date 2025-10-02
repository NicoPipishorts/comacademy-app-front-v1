import { UseAuth } from "@/auth/AuthContext";

export default function useAuthSession() {
	const { session: auth, loading } = UseAuth();
	return { auth, loading };
}
