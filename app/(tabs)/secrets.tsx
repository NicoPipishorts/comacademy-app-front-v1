import CardSimpleButtonSecrets from "@/components/cards/CardSimpleButtonSecrets";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import SecretsDetails from "@/components/secrets/SecretsDetails";
import { primaryBackground } from "@/constants/colors";
import useGetAllSecrets from "@/hooks/useGetAllSecrets";
import { SecretAttributes } from "@/types/secrets";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function Secrets() {
	const { data: secrets } = useGetAllSecrets();
	const [secretData, setSecretData] = useState<SecretAttributes>(null);

	if (!secrets) {
		return <Loader />;
	}

	return (
		<View style={styles.wrapper}>
			<View
				style={{
					paddingHorizontal: 20,
				}}>
				<ScreenHeaders content='3 secrets du succès...' />
			</View>

			{secretData && (
				<SecretsDetails data={secretData} setSecretData={setSecretData} />
			)}

			{!secretData && (
				<ScrollView
					showsVerticalScrollIndicator={false}
					style={{
						paddingHorizontal: 20,
					}}>
					{secrets.data.map((secret) => {
						const imageUrl =
							secret.attributes.headerImage?.data?.attributes?.formats?.medium
								?.url ?? "/uploads/small_3secrets_placeholder_e0a32b6000.png";

						return (
							<CardSimpleButtonSecrets
								key={secret.id}
								image={imageUrl} // Pass the image URL or null
								content={secret.attributes.Brand}
								link={() => setSecretData(secret.attributes)}
							/>
						);
					})}
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingTop: 80,
		paddingBottom: 110,
		backgroundColor: primaryBackground,
	},
});
