import * as Device from "expo-device";
import { useEffect, useState } from "react";

const useIsSpecificiPhoneModel = () => {
	const [isHomeButtonModel, setIsHomeButtonModel] = useState(false);

	useEffect(() => {
		const checkDeviceModel = async () => {
			// Ensure that this check runs only on iOS devices
			if (Device.osName === "iOS") {
				const modelName = Device.modelName;

				// List of iPhone models that have a physical home button (non-plus)
				const homeButtonModels = [
					"iPhone SE", // 1st generation SE
					"iPhone SE (2nd generation)", // 2nd generation SE
					"iPhone 8",
					"iPhone 7",
					"iPhone 6S",
					"iPhone 6",
					"iPhone 5S",
					"iPhone 5C",
					"iPhone 5",
					"iPhone 4S",
					"iPhone 4",
					"iPhone 3GS",
					"iPhone 3G",
					"iPhone", // 1st generation iPhone
				];

				// Check if the current device is one of the supported models
				if (homeButtonModels.includes(modelName)) {
					setIsHomeButtonModel(true);
				} else {
					setIsHomeButtonModel(false);
				}
			} else {
				setIsHomeButtonModel(false);
			}
		};

		checkDeviceModel();
	}, []);

	return isHomeButtonModel;
};

export default useIsSpecificiPhoneModel;
