import CardSimpleButtonSecrets from "@/components/cards/CardSimpleButtonSecrets";
import Loader from "@/components/experience/loader";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useGetAllSecrets from "@/hooks/Secrets/useGetAllSecrets";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import { resolveMediaUrl } from "@/src/utils/resolveMediaUrl";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_SECRET_IMAGE_URL =
	"https://fearless-comfort-efded67ed1.media.strapiapp.com/3secrets_placeholder_e0a32b6000.png";

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
				message='Les 5 premiers 3 secrets du succès sont gratuits. Passez à un abonnement premium pour accéder à tous les contenus.'
			/>

			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.pageHeaderContainer}>
					<PageTitleAvatarHeader
						title='3 secrets du succès'
						showAvatar={false}
					/>
				</View>

				{secrets?.data.map((secret, index) => {
					const mediaCandidate =
						secret.CardImageUrl ??
						secret.CardImageURL ??
						secret.CardImage?.formats?.large?.url ??
						secret.CardImage?.formats?.medium?.url ??
						secret.CardImage?.formats?.small?.url ??
						secret.CardImage?.formats?.thumbnail?.url ??
						secret.CardImage ??
						secret.imageUrl;
					const imageUrl = resolveMediaUrl(
						mediaCandidate,
						DEFAULT_SECRET_IMAGE_URL,
					);
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
		paddingBottom: 90,
		backgroundColor: primaryBackground,
	},
	pageHeaderContainer: {
		paddingHorizontal: 24,
	},
});
