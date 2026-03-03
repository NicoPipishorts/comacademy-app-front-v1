import { localNotifications } from "@/data/localNotifications";
import { UseAuth } from "@/auth/AuthContext";
import { useSubscription } from "@/src/hooks/useSubscription";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { JSX, useEffect } from "react";
import { Platform } from "react-native";

const NOTIFICATION_CONFIG_VERSION = "daily-invite-v2-freemium-monthly";
const NOTIFICATION_CONFIG_KEY = "notificationScheduleConfig";
const PREMIUM_ROUTE = "/subscription";
const ACTIVE_PREMIUM_STATUSES = new Set([
	"active",
	"grace_period",
	"billing_retry",
	"paused",
]);

type NotificationMode = "free" | "standard";
type StoredScheduleConfig = {
	version: string;
	mode: NotificationMode;
	count: number;
};

const getRandomNotification = () => {
	const messages = localNotifications.daily || [];
	if (messages.length === 0) return "Default notification message.";
	const randomIndex = Math.floor(Math.random() * messages.length);
	return messages[randomIndex];
};

const getFreemiumSeries = () => localNotifications.freemiumMonthlySeries || [];

const expectedCountForMode = (mode: NotificationMode): number =>
	mode === "free" ? getFreemiumSeries().length : 1;

const shouldRescheduleNotifications = async (
	mode: NotificationMode
): Promise<boolean> => {
	try {
		const expectedCount = expectedCountForMode(mode);
		if (expectedCount === 0) return false;

		const rawConfig = await AsyncStorage.getItem(NOTIFICATION_CONFIG_KEY);
		const parsedConfig = rawConfig
			? (JSON.parse(rawConfig) as StoredScheduleConfig)
			: null;
		const scheduled = await Notifications.getAllScheduledNotificationsAsync();
		if (!parsedConfig) return true;

		if (parsedConfig.version !== NOTIFICATION_CONFIG_VERSION) return true;
		if (parsedConfig.mode !== mode) return true;
		if (parsedConfig.count !== expectedCount) return true;

		return scheduled.length !== expectedCount;
	} catch (error) {
		console.error("Error checking notification schedule:", error);
		return true;
	}
};

const persistScheduleConfig = async (mode: NotificationMode) => {
	const config: StoredScheduleConfig = {
		version: NOTIFICATION_CONFIG_VERSION,
		mode,
		count: expectedCountForMode(mode),
	};
	await AsyncStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(config));
};

const ensureAndroidChannel = async () => {
	if (Platform.OS !== "android") return;
	await Notifications.setNotificationChannelAsync("default", {
		name: "Default",
		importance: Notifications.AndroidImportance.DEFAULT,
	});
};

const scheduleStandardNotification = async () => {
	await Notifications.scheduleNotificationAsync({
		content: {
			title: "Com Academy",
			body: getRandomNotification(),
			data: { path: "/activity", notificationType: "standard-daily" },
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.DAILY,
			hour: 9,
			minute: 0,
		},
	});
};

const scheduleFreemiumSeries = async () => {
	const messages = getFreemiumSeries();
	await Promise.all(
		messages.map((message, index) =>
			Notifications.scheduleNotificationAsync({
				content: {
					title: message.title,
					body: message.body,
					data: {
						path: PREMIUM_ROUTE,
						notificationType: "freemium-monthly-series",
						sequenceIndex: index + 1,
					},
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
					seconds: (index + 1) * 24 * 60 * 60,
					repeats: false,
				},
			})
		)
	);
};

const scheduleNotifications = async (mode: NotificationMode) => {
	const needsReschedule = await shouldRescheduleNotifications(mode);
	if (!needsReschedule) {
		return;
	}

	await ensureAndroidChannel();
	await Notifications.cancelAllScheduledNotificationsAsync();

	if (mode === "free") {
		await scheduleFreemiumSeries();
	} else {
		await scheduleStandardNotification();
	}

	await persistScheduleConfig(mode);
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
	const { hasPremiumAccess } = useSubscription();

	useEffect(() => {
		const setupNotifications = async () => {
			const { status } = await Notifications.requestPermissionsAsync();
			if (status !== "granted") {
				console.warn("Permission not granted for notifications");
				return;
			}

			const subscriptionStatus = session?.user?.subscription?.status?.toLowerCase();
			const userHasPremiumAccess =
				hasPremiumAccess ||
				Boolean(session?.user?.manualPremium) ||
				Boolean(session?.user?.hasPremiumAccess) ||
				(subscriptionStatus
					? ACTIVE_PREMIUM_STATUSES.has(subscriptionStatus)
					: false);
			const mode: NotificationMode = userHasPremiumAccess ? "standard" : "free";

			await scheduleNotifications(mode);
		};

		// ✅ fixed extra parenthesis
		if (Platform.OS === "ios" || Platform.OS === "android") {
			void setupNotifications();
		}
	}, [hasPremiumAccess, session?.user?.hasPremiumAccess, session?.user?.manualPremium, session?.user?.subscription?.status]);

	return null; // headless side-effect component
};

export default NotificationScheduler;
