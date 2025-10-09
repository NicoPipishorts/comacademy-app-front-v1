import { localNotifications } from "@/data/localNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

const LAST_NOTIFICATION_SCHEDULE_KEY = "lastNotificationSchedule";

const getRandomNotification = (day: "lundi" | "vendredi" | "random") => {
	const messages = localNotifications[day] || [];
	if (messages.length === 0) return "Default notification message.";
	const randomIndex = Math.floor(Math.random() * messages.length);
	return messages[randomIndex];
};

const shouldRescheduleNotifications = async (): Promise<boolean> => {
	try {
		const lastSchedule = await AsyncStorage.getItem(
			LAST_NOTIFICATION_SCHEDULE_KEY
		);
		if (!lastSchedule) return true;

		const scheduled = await Notifications.getAllScheduledNotificationsAsync();
		if (scheduled.length === 0) return true;

		const lastScheduleDate = new Date(lastSchedule);
		const now = new Date();
		const daysSinceLast =
			(now.getTime() - lastScheduleDate.getTime()) / (1000 * 60 * 60 * 24);

		return daysSinceLast > 7;
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

const scheduleWeeklyNotifications = async () => {
	const needsReschedule = await shouldRescheduleNotifications();
	if (!needsReschedule) {
		console.log("Notifications already scheduled, skipping...");
		return;
	}

	console.log("Scheduling weekly notifications...");
	await ensureAndroidChannel();
	await Notifications.cancelAllScheduledNotificationsAsync();

	// Monday 09:00 (weekly repeats implicitly)
	await Notifications.scheduleNotificationAsync({
		content: {
			title: "Inspiration du Lundi 🌟",
			body: getRandomNotification("lundi"),
			data: { path: "/lesCitations" },
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
			weekday: 2, // 1=Sun..7=Sat
			hour: 9,
			minute: 0,
		},
	});

	// Friday 12:00
	await Notifications.scheduleNotificationAsync({
		content: {
			title: "Définition du Vendredi 📚",
			body: getRandomNotification("vendredi"),
			data: { path: "/activity" },
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
			weekday: 6,
			hour: 12,
			minute: 0,
		},
	});

	// Random weekday (Mon–Fri) notification at random time 09:00–16:59
	for (let weekday = 2; weekday <= 6; weekday++) {
		const randomHour = Math.floor(Math.random() * (17 - 9)) + 9; // 9..16
		const randomMinute = Math.floor(Math.random() * 60);

		await Notifications.scheduleNotificationAsync({
			content: {
				title: "La surprise du jour ⚡",
				body: getRandomNotification("random"),
				data: { path: "/index" },
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
				weekday,
				hour: randomHour,
				minute: randomMinute,
			},
		});
	}

	await AsyncStorage.setItem(
		LAST_NOTIFICATION_SCHEDULE_KEY,
		new Date().toISOString()
	);
	console.log("Notifications scheduled successfully");
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
			await scheduleWeeklyNotifications();
		};

		// ✅ fixed extra parenthesis
		if (Platform.OS === "ios" || Platform.OS === "android") {
			setupNotifications();
		}
	}, []);

	return null; // headless side-effect component
};

export default NotificationScheduler;
