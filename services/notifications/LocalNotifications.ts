import { UseAuth } from "@/auth/AuthContext";
import { localNotifications } from "@/data/localNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { JSX, useEffect } from "react";
import { Platform } from "react-native";

const LAST_NOTIFICATION_SCHEDULE_KEY = "lastNotificationSchedule";

const getRandomNotification = (day: "lundi" | "vendredi" | "freemium") => {
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

const scheduleWeeklyNotifications = async (isFreemiumUser: boolean) => {
	const needsReschedule = await shouldRescheduleNotifications();
	if (!needsReschedule) {
		return;
	}

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

	// Random weekday (Mon–Fri) notification - only for freemium users
	if (isFreemiumUser) {
		for (let weekday = 2; weekday <= 6; weekday++) {
			const randomHour = Math.floor(Math.random() * (17 - 9)) + 9; // 9..16
			const randomMinute = Math.floor(Math.random() * 60);

			await Notifications.scheduleNotificationAsync({
				content: {
					title: "La version gratuite, c'est bien pour tester. Mais toi t'es pas là pour tester, t'es là pour briller non ? Abonnes-toi",
					body: getRandomNotification("freemium"),
					data: { path: "/subscription" },
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
					weekday,
					hour: randomHour,
					minute: randomMinute,
				},
			});
		}
	}

	await AsyncStorage.setItem(
		LAST_NOTIFICATION_SCHEDULE_KEY,
		new Date().toISOString()
	);
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
	const { session } = UseAuth();

	useEffect(() => {
		const setupNotifications = async () => {
			const { status } = await Notifications.requestPermissionsAsync();
			if (status !== "granted") {
				console.warn("Permission not granted for notifications");
				return;
			}

			// Check if user is freemium (not premium)
			const hasManualPremium = session?.user?.manualPremium ?? false;
			const hasPremiumAccess = session?.user?.hasPremiumAccess ?? false;
			const subscriptionStatus = session?.user?.subscription?.status;
			const isPremium =
				hasManualPremium ||
				hasPremiumAccess ||
				subscriptionStatus === "active" ||
				subscriptionStatus === "grace_period" ||
				subscriptionStatus === "billing_retry";
			const isFreemiumUser = !isPremium;

			await scheduleWeeklyNotifications(isFreemiumUser);
		};

		// ✅ fixed extra parenthesis
		if (Platform.OS === "ios" || Platform.OS === "android") {
			setupNotifications();
		}
	}, [session]);

	return null; // headless side-effect component
};

export default NotificationScheduler;
