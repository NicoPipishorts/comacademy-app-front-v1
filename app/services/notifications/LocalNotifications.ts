import { localNotifications } from "@/app/data/localNotifications";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

// Function to randomly select a notification message
const getRandomNotification = (day: "lundi" | "vendredi") => {
	const messages = localNotifications[day] || [];
	if (messages.length === 0) return "Default notification message.";
	const randomIndex = Math.floor(Math.random() * messages.length);
	return messages[randomIndex];
};

const debugNotifications = async () => {
	const scheduledNotifications =
		await Notifications.getAllScheduledNotificationsAsync();
	console.log("Scheduled Notifications:", scheduledNotifications);
};
debugNotifications();

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
			hour: 15,
			minute: 12,
			repeats: true,
		},
	});

	console.log("Weekly notifications scheduled successfully.");
};

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
