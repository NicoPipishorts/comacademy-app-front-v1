import SignIn from "@/screens/Sign-in";
import { useLocalSearchParams } from "expo-router";

const getFirstQueryValue = (
	value: string | string[] | undefined
): string | null => {
	if (typeof value === "string") return value;
	if (Array.isArray(value)) {
		const first = value.find(
			(candidate) => typeof candidate === "string" && candidate.trim().length > 0
		);
		return first ?? null;
	}
	return null;
};

export default function ResetPasswordRoute() {
	const params = useLocalSearchParams<{
		code?: string | string[];
		token?: string | string[];
		reset_code?: string | string[];
		email?: string | string[];
	}>();

	const initialResetCode =
		getFirstQueryValue(params.code) ??
		getFirstQueryValue(params.token) ??
		getFirstQueryValue(params.reset_code);
	const initialResetEmail = getFirstQueryValue(params.email);

	return (
		<SignIn
			initialResetCode={initialResetCode}
			initialResetEmail={initialResetEmail}
		/>
	);
}
