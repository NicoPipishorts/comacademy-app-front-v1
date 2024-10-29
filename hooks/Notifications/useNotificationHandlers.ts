// useNotificationHandlers.ts
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";

export function useNotificationHandlers() {
	const [notification, setNotification] =
		useState<Notifications.Notification | null>(null);
	const notificationListener = useRef<any>();
	const responseListener = useRef<any>();

	useEffect(() => {
		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				setNotification(notification);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log("Notification response received:", response);
			});

		return () => {
			Notifications.removeNotificationSubscription(
				notificationListener.current
			);
			Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	return notification;
}
