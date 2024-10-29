import { useNotificationHandlers } from "@/hooks/Notifications/useNotificationHandlers";
import {
	registerForPushNotificationsAsync,
	setupNotificationChannels,
} from "@/services/NotificationService";
import React, { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";

import * as Notifications from "expo-notifications";

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
				Alert.alert("Notification Setup Failed", "Could not get push token.");
			}
		});
	}, []);

	return (
		<PushNotificationContext.Provider value={{ expoPushToken, notification }}>
			{children}
		</PushNotificationContext.Provider>
	);
};
