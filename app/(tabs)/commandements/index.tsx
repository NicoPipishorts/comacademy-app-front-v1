import CardSimpleButtonCommandements from "@/components/cards/CardSimpleButtonCommandements";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import useGetAllCommandements from "@/hooks/Commandements/useGetAllCommandements";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Secrets() {
	const insets = useSafeAreaInsets();
	const { data: commandements, isFetched } = useGetAllCommandements();

	useTrackPageMetrics({ page: "Commandements" });

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
				<ScreenHeaders content='Tips and Tactics' />
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{
					paddingTop: 30,
					paddingHorizontal: 20,
				}}>
				{commandements.data.map((commandement) => {
					const imageUrl =
						commandement.attributes.headerImage?.data?.attributes?.formats
							?.medium?.url ??
						"https://fearless-comfort-efded67ed1.media.strapiapp.com/tips_n_tactics_52aeea960b.png";

					return (
						<CardSimpleButtonCommandements
							key={commandement.id}
							itemId={commandement.id}
							content={commandement.attributes.Theme}
							image={imageUrl}
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
