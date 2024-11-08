// NotificationService.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync(): Promise<
	string | null
> {
	if (!Device.isDevice) return null;

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}

	if (finalStatus !== "granted") {
		console.warn("Failed to get push token for push notification!");
		return null;
	}

	const token = (await Notifications.getExpoPushTokenAsync()).data;
	return token;
}

export function setupNotificationChannels() {
	if (Platform.OS === "android") {
		Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}
}

// Function to schedule a one-time or repeating local notification
export async function scheduleLocalNotification(
	title: string,
	body: string,
	trigger: Notifications.NotificationTriggerInput
) {
	await Notifications.scheduleNotificationAsync({
		content: {
			title,
			body,
		},
		trigger,
	});
}

// Function to schedule a daily notification at a specified time
export function scheduleDailyNotification(
	title: string,
	body: string,
	hour: number,
	minute: number
) {
	return scheduleLocalNotification(title, body, {
		hour,
		minute,
		repeats: true,
	});
}

// Function to schedule multiple notifications with specified delays in seconds
export function scheduleMultipleNotifications(
	notifications: { title: string; body: string; delayInSeconds: number }[]
) {
	notifications.forEach(({ title, body, delayInSeconds }) => {
		scheduleLocalNotification(title, body, { seconds: delayInSeconds });
	});
}
