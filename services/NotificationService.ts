import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

type ScheduledNotification = {
	title: string;
	body: string;
	delayInSeconds: number;
	data?: Notifications.NotificationContentInput["data"];
};

const PUSH_TOKEN_STORAGE_KEY = "expoPushToken";

export const setupNotificationChannels = async () => {
	if (Platform.OS !== "android") {
		return;
	}

	await Notifications.setNotificationChannelAsync("default", {
		name: "default",
		importance: Notifications.AndroidImportance.MAX,
		sound: "default",
		vibrationPattern: [0, 250, 250, 250],
		lightColor: "#FF231F7C",
	});
};

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
	try {
		if (!Device.isDevice) {
			console.warn("Push notifications are not supported on simulators/emulators.");
			return null;
		}

		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const permissionResponse = await Notifications.requestPermissionsAsync();
			finalStatus = permissionResponse.status;
		}

		if (finalStatus !== "granted") {
			console.warn("Push notification permission not granted.");
			return null;
		}

		const tokenResponse = await Notifications.getExpoPushTokenAsync();
		const token = tokenResponse.data;

		if (token) {
			await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
		}

		return token;
	} catch (error) {
		console.error("Failed to register for push notifications", error);
		return null;
	}
};

export const scheduleMultipleNotifications = async (
	notifications: ScheduledNotification[]
) => {
	if (!notifications.length) {
		return;
	}

	await Promise.all(
		notifications.map(async ({ title, body, delayInSeconds, data }) => {
			const triggerSeconds = Math.max(delayInSeconds, 1);
			await Notifications.scheduleNotificationAsync({
				content: {
					title,
					body,
					data,
				},
				trigger: {
					seconds: triggerSeconds,
					repeats: false,
				},
			});
		})
	);
};

