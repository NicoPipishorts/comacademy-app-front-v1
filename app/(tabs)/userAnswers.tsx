import Loader from "@/components/experience/loader";
import { primaryBackground } from "@/constants/colors";
import useCategoriesFull from "@/hooks/useCategoriesFull";
import { useGetAllAnswer } from "@/hooks/useGetAllAnswers";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { ScrollView, StyleSheet, View } from "react-native";
import ScreenHeaders from "../../components/ScreenHeaders";

export default function UserAnswersList() {
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const { data: allAnswers } = useGetAllAnswer(userId, token);
	const { data: categories } = useCategoriesFull();

	if (!allAnswers || !categories) {
		return <Loader />;
	}
	return (
		<>
			<View style={styles.wrapper}>
				<ScreenHeaders content='Mes Réponses' />
				<ScrollView showsVerticalScrollIndicator={false}></ScrollView>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 100,
		paddingBottom: 100,
		backgroundColor: primaryBackground,
	},
});
