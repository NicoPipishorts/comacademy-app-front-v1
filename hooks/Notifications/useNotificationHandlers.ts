// useNotificationHandlers.ts
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";

export function useNotificationHandlers() {
	const [notification, setNotification] =
		useState<Notifications.Notification | null>(null);
	const notificationListener = useRef<Notifications.EventSubscription | null>(
		null
	);
	const responseListener = useRef<Notifications.EventSubscription | null>(null);

	useEffect(() => {
		notificationListener.current =
			Notifications.addNotificationReceivedListener((incomingNotification) => {
				setNotification(incomingNotification);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log("Notification response received:", response);
			});

		return () => {
			notificationListener.current?.remove();
			responseListener.current?.remove();
		};
	}, []);

	return notification;
}
