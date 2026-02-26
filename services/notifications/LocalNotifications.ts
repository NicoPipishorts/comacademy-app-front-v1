import { localNotifications } from "@/data/localNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { JSX, useEffect } from "react";
import { Platform } from "react-native";

const NOTIFICATION_CONFIG_VERSION = "daily-invite-v1";
const NOTIFICATION_CONFIG_KEY = "notificationScheduleConfigVersion";

const getRandomNotification = () => {
	const messages = localNotifications.daily || [];
	if (messages.length === 0) return "Default notification message.";
	const randomIndex = Math.floor(Math.random() * messages.length);
	return messages[randomIndex];
};

const shouldRescheduleNotifications = async (): Promise<boolean> => {
	try {
		const scheduleVersion = await AsyncStorage.getItem(NOTIFICATION_CONFIG_KEY);
		const scheduled = await Notifications.getAllScheduledNotificationsAsync();
		if (scheduleVersion !== NOTIFICATION_CONFIG_VERSION) return true;
		return scheduled.length !== 1;
	} catch (error) {
		console.error("Error checking notification schedule:", error);
		return true;
	}
};

const ensureAndroidChannel = async () => {
	if (Platform.OS !== "android") return;
	await Notifications.setNotificationChannelAsync("default", {
		name: "Default",
		importance: Notifications.AndroidImportance.DEFAULT,
	});
};

const scheduleDailyNotifications = async () => {
	const needsReschedule = await shouldRescheduleNotifications();
	if (!needsReschedule) {
		return;
	}

	await ensureAndroidChannel();
	await Notifications.cancelAllScheduledNotificationsAsync();

	// Daily 09:00
	await Notifications.scheduleNotificationAsync({
		content: {
			title: "Com Academy",
			body: getRandomNotification(),
			data: { path: "/activity" },
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.DAILY,
			hour: 9,
			minute: 0,
		},
	});

	await AsyncStorage.setItem(NOTIFICATION_CONFIG_KEY, NOTIFICATION_CONFIG_VERSION);
};

// Foreground behavior
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

// ✅ Component that returns JSX (not void)
const NotificationScheduler = (): JSX.Element | null => {
	useEffect(() => {
		const setupNotifications = async () => {
			const { status } = await Notifications.requestPermissionsAsync();
			if (status !== "granted") {
				console.warn("Permission not granted for notifications");
				return;
			}

			await scheduleDailyNotifications();
		};

		// ✅ fixed extra parenthesis
		if (Platform.OS === "ios" || Platform.OS === "android") {
			setupNotifications();
		}
	}, []);

	return null; // headless side-effect component
};

export default NotificationScheduler;
