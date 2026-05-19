import CardSimpleButtonSecrets from "@/components/cards/CardSimpleButtonSecrets";
import LargeImageCardListSkeleton from "@/components/experience/LargeImageCardListSkeleton";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { primaryBackground } from "@/constants/colors";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useTrackRubricOpened } from "@/hooks/Rubrics/useRubricNotifications";
import useGetAllSecrets from "@/hooks/Secrets/useGetAllSecrets";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import { resolveMediaUrl } from "@/src/utils/resolveMediaUrl";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_SECRET_IMAGE_URL =
	"https://fearless-comfort-efded67ed1.media.strapiapp.com/3secrets_placeholder_e0a32b6000.png";

export default function Secrets() {
	useTrackRubricOpened("secrets");
	const insets = useSafeAreaInsets();
	const { data: secrets, isFetched } = useGetAllSecrets();

	useTrackPageMetrics({ page: "Secrets" });

	const {
		isItemLocked,
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
	} = useSubscriptionLimit({ freeLimit: 5 });

	return (
		<View style={styles.wrapper}>
			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message='Les 5 premières capsules sont gratuites. Passez à un abonnement premium pour accéder à tous les contenus.'
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingTop: insets.top },
				]}>
				<PageTitleAvatarHeader
					title='La Capsule'
					showAvatar={false}
					containerStyle={styles.pageHeaderContainer}
				/>

				{!isFetched || !secrets ? (
					<LargeImageCardListSkeleton
						cardCount={3}
						horizontalPadding={0}
						includeTopSpacing={true}
					/>
				) : (
					secrets.data.map((secret, index) => {
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
					})
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	scrollContent: {
		paddingBottom: 90,
	},
	pageHeaderContainer: {
		paddingHorizontal: 30,
	},
});
