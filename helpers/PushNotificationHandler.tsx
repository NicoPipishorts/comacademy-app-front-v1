import { useSavePushToken } from "@/api/sendPushToken";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

// Set up notification handler to show alerts in foreground
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export const PushNotificationHandler = () => {
	const [expoPushToken, setExpoPushToken] = useState(null);
	const { userId } = useUserId();
	const { token: authToken } = useJwtToken();
	const { mutate: savePushToken } = useSavePushToken(
		(data) => {},
		(error) => {}
	);

	useEffect(() => {
		// Initialize push notification setup on mount
		initializePushNotifications();
	}, []);

	useEffect(() => {
		// Save push token to backend when it changes
		if (expoPushToken) {
			savePushToken({ token: expoPushToken, userId, authToken });
		}
	}, [expoPushToken, userId, authToken, savePushToken]);

	// Function to initialize push notifications
	const initializePushNotifications = async () => {
		const token = await registerForPushNotificationsAsync();
		if (token) setExpoPushToken(token);

		// Add listeners for received notifications
		Notifications.addNotificationReceivedListener(handleNotificationReceived);
		Notifications.addNotificationResponseReceivedListener(
			handleNotificationResponse
		);

		// Schedule notifications
		await scheduleNotifications();
	};

	// Function to register for push notifications and retrieve the token
	const registerForPushNotificationsAsync = async () => {
		const { status } = await Notifications.requestPermissionsAsync();
		if (status !== "granted") {
			Alert.alert("Permission required", "Failed to get push token!");
			return null;
		}

		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#FF231F7C",
			});
		}

		const token = (await Notifications.getExpoPushTokenAsync()).data;
		return token;
	};

	// Handler for received notifications
	const handleNotificationReceived = (notification) => {
		console.log("Notification received:", notification);
	};

	// Handler for notification response (when tapped)
	const handleNotificationResponse = (response) => {
		console.log("Notification response tapped:", response);
	};

	// Function to schedule notifications at specific intervals
	const scheduleNotifications = async () => {
		await Notifications.cancelAllScheduledNotificationsAsync();

		const notifications = [
			// {
			// 	title: "Quick Reminder",
			// 	body: "This is your first scheduled notification!",
			// 	seconds: 10,
			// },
			// {
			// 	title: "Another Reminder",
			// 	body: "Here’s another notification for you!",
			// 	seconds: 30,
			// },
			// {
			// 	title: "Final Reminder",
			// 	body: "This is the last scheduled notification.",
			// 	seconds: 60,
			// },
		];

		for (const { title, body, seconds } of notifications) {
			await Notifications.scheduleNotificationAsync({
				content: { title, body },
				trigger: { seconds },
			});
		}
	};

	return null; // This component only sets up notifications; no UI needed
};
