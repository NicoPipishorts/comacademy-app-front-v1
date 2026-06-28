import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CardSimpleButtonSecrets from "@/components/cards/CardSimpleButtonSecrets";
import LargeImageCardListSkeleton from "@/components/experience/LargeImageCardListSkeleton";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import { primaryBackground } from "@/constants/colors";
import useGetAllSecrets from "@/hooks/Secrets/useGetAllSecrets";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useTrackRubricOpened } from "@/hooks/Rubrics/useRubricNotifications";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import { resolveMediaUrl } from "@/src/utils/resolveMediaUrl";

const resolveSecretImage = (secret: {
	CardImageUrl?: string;
	CardImageURL?: string;
	imageUrl?: string;
	CardImage?: {
		url?: string;
		formats?: {
			large?: { url?: string };
			medium?: { url?: string };
			small?: { url?: string };
			thumbnail?: { url?: string };
		};
	} | null;
}) =>
	resolveMediaUrl(
		secret.CardImageUrl ||
			secret.CardImageURL ||
			secret.imageUrl ||
			secret.CardImage?.formats?.large?.url ||
			secret.CardImage?.formats?.medium?.url ||
			secret.CardImage?.formats?.small?.url ||
			secret.CardImage?.formats?.thumbnail?.url ||
			secret.CardImage?.url,
		undefined,
	) ?? "";

export default function Secrets() {
	useTrackRubricOpened("secrets");
	useTrackPageMetrics({ page: "Secrets" });

	const insets = useSafeAreaInsets();
	const { data, isLoading, isFetched } = useGetAllSecrets();
	const {
		isItemLocked,
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
	} = useSubscriptionLimit({ freeLimit: 5 });

	const secrets = data?.data ?? [];
	const showSkeleton = isLoading && !isFetched;
	const showEmptyState = isFetched && secrets.length === 0;

	return (
		<View style={styles.wrapper}>
			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message='Les 5 premiers secrets sont gratuits. Passez à un abonnement premium pour accéder à tous les contenus.'
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingTop: insets.top,
					paddingHorizontal: 20,
					paddingBottom: 120,
				}}>
				<PageTitleAvatarHeader title='3 Secrets du succès' showAvatar={false} />

				{showSkeleton && (
					<LargeImageCardListSkeleton
						cardCount={3}
						horizontalPadding={0}
						includeTopSpacing={true}
					/>
				)}

				{showEmptyState && (
					<View style={styles.emptyStateContainer}>
						<Text style={styles.emptyStateText}>
							Aucun secret disponible pour le moment
						</Text>
					</View>
				)}

				{!showSkeleton &&
					secrets.map((secret, index) => {
						const locked = isItemLocked(index);

						return (
							<CardSimpleButtonSecrets
								key={secret.id}
								itemId={secret.documentId}
								content={secret.Brand}
								image={resolveSecretImage(secret)}
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
		backgroundColor: primaryBackground,
	},
	emptyStateContainer: {
		minHeight: 220,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	emptyStateText: {
		fontSize: 16,
		color: "#666",
		textAlign: "center",
	},
});
