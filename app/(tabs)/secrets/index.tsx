import CardSimpleButtonSecrets from "@/components/cards/CardSimpleButtonSecrets";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { useSecrets } from "@/context/contextSecrets";
import useGetAllSecrets from "@/hooks/useGetAllSecrets";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Secrets() {
	const insets = useSafeAreaInsets();
	const { data: secrets, isFetched } = useGetAllSecrets();
	const { setData } = useSecrets();

	useEffect(() => {
		if (isFetched) {
			setData(secrets);
		}
	}, [secrets, isFetched, setData]);

	if (!secrets) {
		return <Loader />;
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View
					style={{
						paddingHorizontal: 20,
					}}>
					<ScreenHeaders content='3 secrets du succès' />
				</View>

				{secrets.data.map((secret) => {
					const imageUrl =
						secret.attributes.headerImage?.data?.attributes?.formats?.medium
							?.url ?? "/uploads/small_3secrets_placeholder_e0a32b6000.png";

					return (
						<CardSimpleButtonSecrets
							key={secret.id}
							itemId={secret.id}
							image={imageUrl}
							content={secret.attributes.Brand}
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
		paddingBottom: 100,
		backgroundColor: primaryBackground,
	},
});
