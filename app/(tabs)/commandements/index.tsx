import CardSimpleButtonCommandements from "@/components/cards/CardSimpleButtonCommandements";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import useGetAllCommandements from "@/hooks/Commandements/useGetAllCommandements";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useJwtToken from "@/hooks/useJwtToken";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Secrets() {
	const insets = useSafeAreaInsets();
	const { data: commandements, isFetched } = useGetAllCommandements();
	const { token } = useJwtToken();

	useTrackPageMetrics({ page: "Commandements", token });

	if (!commandements || !isFetched) {
		return <Loader />;
	}
	return (
		<View style={styles.wrapper}>
			<View
				style={{
					paddingHorizontal: 20,
					paddingTop: insets.top,
				}}>
				<ScreenHeaders content='10 Commandements' />
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{
					paddingTop: 30,
					paddingHorizontal: 20,
				}}>
				{commandements.data.map((commandement) => {
					return (
						<CardSimpleButtonCommandements
							key={commandement.id}
							itemId={commandement.id}
							content={commandement.attributes.Theme}
						/>
					);
				})}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingBottom: 90,
		backgroundColor: primaryBackground,
	},
});
