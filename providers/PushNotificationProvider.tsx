// PushNotificationProvider.tsx
import { useNotificationHandlers } from "@/hooks/Notifications/useNotificationHandlers";
import {
	registerForPushNotificationsAsync,
	scheduleMultipleNotifications,
	setupNotificationChannels,
} from "@/services/NotificationService";
import * as Notifications from "expo-notifications";
import React, { createContext, useEffect, useState } from "react";

interface PushNotificationContextType {
	expoPushToken: string | null;
	notification: Notifications.Notification | null;
}

export const PushNotificationContext =
	createContext<PushNotificationContextType>({
		expoPushToken: null,
		notification: null,
	});

export const PushNotificationProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
	const notification = useNotificationHandlers();

	useEffect(() => {
		setupNotificationChannels();

		registerForPushNotificationsAsync().then((token) => {
			if (token) {
				setExpoPushToken(token);
			} else {
				// Alert.alert("Notification Setup Failed", "Could not get push token.");
			}
		});

		// Schedule a daily notification at 9:00 AM
		scheduleMultipleNotifications([
			// {
			// 	title: "Notification 1",
			// 	body: "This is the first notification",
			// 	delayInSeconds: 20,
			// },
			// {
			// 	title: "Notification 2",
			// 	body: "This is the second notification",
			// 	delayInSeconds: 30,
			// },
			// {
			// 	title: "Notification 3",
			// 	body: "This is the third notification",
			// 	delayInSeconds: 60,
			// },
		]);
	}, []);

	return (
		<PushNotificationContext.Provider value={{ expoPushToken, notification }}>
			{children}
		</PushNotificationContext.Provider>
	);
};
