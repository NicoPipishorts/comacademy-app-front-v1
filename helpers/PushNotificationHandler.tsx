import { useSavePushToken } from "@/api/sendPushToken";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, Platform, Text } from "react-native";

// Set up notification handler to show alerts in foreground
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true, // Ensure notification is shown when the app is in foreground
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export const PushNotificationHandler = () => {
	const [expoPushToken, setExpoPushToken] = useState("");
	const { userId } = useUserId();
	const { token: authToken } = useJwtToken();

	// Use the custom hook to save the push token
	const { mutate: savePushToken, error } = useSavePushToken(
		(data) => {},
		(error) => {}
	);

	useEffect(() => {
		// Register for push notifications and set the token
		registerForPushNotificationsAsync().then((token) => {
			setExpoPushToken(token);
		});

		// Handle notification received when the app is open (foreground)
		const notificationListener = Notifications.addNotificationReceivedListener(
			(notification) => {
				console.log("This is the received push notification: ", notification);
			}
		);

		// Clean up listener when the component unmounts
		return () => {
			Notifications.removeNotificationSubscription(notificationListener);
		};
	}, []);

	// Trigger the savePushToken mutation when the expoPushToken is set
	useEffect(() => {
		if (expoPushToken) {
			savePushToken({ token: expoPushToken, userId, authToken });
		}
	}, [authToken, expoPushToken, savePushToken, userId]);

	// Updated function to register for push notifications and retrieve the token
	async function registerForPushNotificationsAsync() {
		let token;
		try {
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;
			if (existingStatus !== "granted") {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}

			if (finalStatus !== "granted") {
				Alert.alert(
					"Permission required",
					"Failed to get push token for push notification!"
				);
				return;
			}

			// Android-specific notification channel setup
			if (Platform.OS === "android") {
				await Notifications.setNotificationChannelAsync("default", {
					name: "default",
					importance: Notifications.AndroidImportance.MAX,
					vibrationPattern: [0, 250, 250, 250],
					lightColor: "#FF231F7C",
				});
			}

			// Get the Expo push token for the device
			token = (await Notifications.getExpoPushTokenAsync()).data;
			console.log("Push Notification Token:", token);
		} catch (error) {
			console.error("Error getting push token:", error);
		}

		return token;
	}

	// Return null because this component only handles background logic-
	return <Text>{expoPushToken}</Text>;
};
