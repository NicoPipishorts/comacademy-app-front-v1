import { localNotifications } from "@/data/localNotifications";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

// Update the getRandomNotification function to also handle "random" messages.
const getRandomNotification = (day: "lundi" | "vendredi" | "random") => {
	const messages = localNotifications[day] || [];
	if (messages.length === 0) return "Default notification message.";
	const randomIndex = Math.floor(Math.random() * messages.length);
	return messages[randomIndex];
};

// Function to schedule weekly notifications
const scheduleWeeklyNotifications = async () => {
	// Cancel existing notifications to avoid duplicates
	await Notifications.cancelAllScheduledNotificationsAsync();

	// Schedule Monday notification at 9 AM
	await Notifications.scheduleNotificationAsync({
		content: {
			title: "Inspiration du Lundi 🌟",
			body: getRandomNotification("lundi"),
			data: { path: "/lesCitations" },
		},
		trigger: {
			weekday: 2, // Monday
			hour: 9,
			minute: 0,
			repeats: true,
		},
	});

	// Schedule Friday notification at 12 PM
	await Notifications.scheduleNotificationAsync({
		content: {
			title: "Définition du Vendredi 📚",
			body: getRandomNotification("vendredi"),
			data: { path: "/activity" },
		},
		trigger: {
			weekday: 6, // Friday
			hour: 12,
			minute: 0,
			repeats: true,
		},
	});

	// Schedule a random weekday notification for every weekday (Monday=2 to Friday=6).
	// The time is selected randomly between 9 AM and 5 PM.
	for (let weekday = 2; weekday <= 6; weekday++) {
		const randomHour = Math.floor(Math.random() * (17 - 9)) + 9; // Hour between 9 (inclusive) and 17 (exclusive)
		const randomMinute = Math.floor(Math.random() * 60); // Minute between 0 and 59

		await Notifications.scheduleNotificationAsync({
			content: {
				title: "La surprise du jour ⚡",
				body: getRandomNotification("random"),
				data: { path: "/index" },
			},
			trigger: {
				weekday,
				hour: randomHour,
				minute: randomMinute,
				repeats: true,
			},
		});
	}
};

// Set the notification handler so that alerts are shown when notifications are received.
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

// Notification scheduler component
const NotificationScheduler: React.FC = () => {
	useEffect(() => {
		const setupNotifications = async () => {
			const { status } = await Notifications.requestPermissionsAsync();
			if (status !== "granted") {
				console.warn("Permission not granted for notifications");
				return;
			}

			await scheduleWeeklyNotifications();
		};

		if (Platform.OS === "ios" || Platform.OS === "android") {
			setupNotifications();
		}
	}, []);

	return null; // No UI needed for this component
};

export default NotificationScheduler;
