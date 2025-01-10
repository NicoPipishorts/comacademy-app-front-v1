import { colorGrey } from "@/constants/colors";
import { View } from "react-native";

export default function ModalGestureLine() {
	return (
		<View
			style={{
				width: 45,
				height: 3,
				backgroundColor: colorGrey,
				borderRadius: 10,
				alignSelf: "center",
				marginBottom: 10,
			}}
		/>
	);
}
