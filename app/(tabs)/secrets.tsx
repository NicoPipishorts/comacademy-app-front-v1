import CardSimpleButton from "@/components/cards/CardSimpleButton";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import SecretsDetails from "@/components/secrets/Details";
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
						return (
							<CardSimpleButton
								key={secret.id}
								image={
									secret.attributes.headerImage.data
										? secret.attributes.headerImage.data.attributes.formats
												.medium.url
										: null
								}
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
