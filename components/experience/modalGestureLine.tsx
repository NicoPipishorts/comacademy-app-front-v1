import { colorDarkGrey } from "@/constants/colors";
import { View } from "react-native";

export default function ModalGestureLine() {
	return (
		<View
			style={{
				width: 65,
				height: 3,
				backgroundColor: colorDarkGrey,
				borderRadius: 10,
				alignSelf: "center",
				marginBottom: 15,
			}}
		/>
	);
}
