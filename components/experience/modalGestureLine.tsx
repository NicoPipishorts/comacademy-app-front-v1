import { colorDarkGrey } from "@/constants/colors";
import { StyleProp, View, ViewStyle } from "react-native";

export default function ModalGestureLine({
	style,
}: {
	style?: StyleProp<ViewStyle>;
}) {
	return (
		<View
			style={[
				{
					width: 65,
					height: 3,
					backgroundColor: colorDarkGrey,
					borderRadius: 10,
					alignSelf: "center",
					marginBottom: 15,
				},
				style,
			]}
		/>
	);
}
