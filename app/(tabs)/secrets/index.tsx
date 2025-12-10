import CardSimpleButtonSecrets from "@/components/cards/CardSimpleButtonSecrets";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetAllSecrets from "@/hooks/Secrets/useGetAllSecrets";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Secrets() {
	const insets = useSafeAreaInsets();
	const { data: secrets, isFetched } = useGetAllSecrets();

	useTrackPageMetrics({ page: "Secrets" });

	const {
		isItemLocked,
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
	} = useSubscriptionLimit({ freeLimit: 5 });

	if (!secrets || !isFetched) {
		return <Loader />;
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message="Les 5 premiers 3 secrets du succès sont gratuits. Passez à un abonnement premium pour accéder à tous les contenus."
			/>

			<ScrollView showsVerticalScrollIndicator={false}>
				<View
					style={{
						paddingHorizontal: 20,
					}}>
					<ScreenHeaders content='3 secrets du succès' />
				</View>

				{secrets?.data.map((secret, index) => {
					const imageUrl =
						secret.imageUrl ??
						"https://fearless-comfort-efded67ed1.media.strapiapp.com/3secrets_placeholder_e0a32b6000.png";
					const locked = isItemLocked(index);

					return (
						<CardSimpleButtonSecrets
							key={secret.id}
							itemId={secret.documentId}
							image={imageUrl}
							content={secret.Brand}
							locked={locked}
							onPress={locked ? handleLockedItemPress : undefined}
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
		paddingTop: 80,
		paddingBottom: 90,
		backgroundColor: primaryBackground,
	},
});
