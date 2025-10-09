import { Redirect } from "expo-router";

// This route exists purely to handle the deep link path
// expo-router will route here, then immediately redirect to (tabs)
// The Sign-in screen will handle the deep link via its useEffect
export default function ResetPasswordRedirect() {
	return <Redirect href="/(tabs)" />;
}
