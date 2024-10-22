import useGetNiveaux from "@/hooks/useGetNiveaux";
import useJwtToken from "@/hooks/useJwtToken";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Loader from "../experience/loader";

interface Props {
	totalPoints: number;
}

export default function ShowNiveaux({ totalPoints }: Props) {
	const { token } = useJwtToken();
	const { data: niveaux } = useGetNiveaux(token);

	const [isOverflowing, setIsOverflowing] = useState(false);
	const [scrollViewHeight, setScrollViewHeight] = useState(0);
	const [contentHeight, setContentHeight] = useState(0);

	const [niveauStatut, setNiveauStatut] = useState<string | null>(null);
	const [niveauNumber, setNiveauNumber] = useState<number | null>(null);
	const [niveauCitation, setNiveauCitation] = useState<string | null>(null);
	const [niveauCommentaire, setNiveauCommentaire] = useState<string | null>(
		null
	);

	useEffect(() => {
		if (niveaux) {
			niveauText(totalPoints);
		}
	}, [niveaux, totalPoints]);

	useEffect(() => {
		setIsOverflowing(contentHeight > scrollViewHeight);
	}, [contentHeight, scrollViewHeight]);

	if (!niveaux) {
		return <Loader />;
	}

	const niveauText = (points: number) => {
		if (points <= 150) {
			setNiveauStatut(niveaux.data[0].attributes.statut);
			setNiveauNumber(0);
			setNiveauCitation(niveaux.data[0].attributes.citation);
			setNiveauCommentaire(niveaux.data[0].attributes.commentaires);
		} else if (points > 150 && points <= 300) {
			setNiveauStatut(niveaux.data[1].attributes.statut);
			setNiveauNumber(1);
			setNiveauCitation(niveaux.data[1].attributes.citation);
			setNiveauCommentaire(niveaux.data[1].attributes.commentaires);
		} else if (points > 300 && points <= 450) {
			setNiveauStatut(niveaux.data[2].attributes.statut);
			setNiveauNumber(2);
			setNiveauCitation(niveaux.data[2].attributes.citation);
			setNiveauCommentaire(niveaux.data[2].attributes.commentaires);
		} else if (points > 450 && points <= 600) {
			setNiveauStatut(niveaux.data[3].attributes.statut);
			setNiveauNumber(3);
			setNiveauCitation(niveaux.data[3].attributes.citation);
			setNiveauCommentaire(niveaux.data[3].attributes.commentaires);
		} else if (points > 600 && points <= 750) {
			setNiveauStatut(niveaux.data[4].attributes.statut);
			setNiveauNumber(4);
			setNiveauCitation(niveaux.data[4].attributes.citation);
			setNiveauCommentaire(niveaux.data[4].attributes.commentaires);
		} else if (points > 750 && points <= 900) {
			setNiveauStatut(niveaux.data[5].attributes.statut);
			setNiveauNumber(5);
			setNiveauCitation(niveaux.data[5].attributes.citation);
			setNiveauCommentaire(niveaux.data[5].attributes.commentaires);
		} else if (points > 900 && points <= 1050) {
			setNiveauStatut(niveaux.data[6].attributes.statut);
			setNiveauNumber(6);
			setNiveauCitation(niveaux.data[6].attributes.citation);
			setNiveauCommentaire(niveaux.data[6].attributes.commentaires);
		} else if (points > 1050 && points <= 1200) {
			setNiveauStatut(niveaux.data[7].attributes.statut);
			setNiveauNumber(7);
			setNiveauCitation(niveaux.data[7].attributes.citation);
			setNiveauCommentaire(niveaux.data[7].attributes.commentaires);
		} else if (points > 1200 && points <= 1350) {
			setNiveauStatut(niveaux.data[8].attributes.statut);
			setNiveauNumber(8);
			setNiveauCitation(niveaux.data[8].attributes.citation);
			setNiveauCommentaire(niveaux.data[8].attributes.commentaires);
		} else if (points > 1350 && points <= 1500) {
			setNiveauStatut(niveaux.data[9].attributes.statut);
			setNiveauNumber(9);
			setNiveauCitation(niveaux.data[9].attributes.citation);
			setNiveauCommentaire(niveaux.data[9].attributes.commentaires);
		} else if (points > 1500 && points <= 1650) {
			setNiveauStatut(niveaux.data[10].attributes.statut);
			setNiveauNumber(10);
			setNiveauCitation(niveaux.data[10].attributes.citation);
			setNiveauCommentaire(niveaux.data[10].attributes.commentaires);
		} else if (points > 1650 && points <= 1800) {
			setNiveauStatut(niveaux.data[11].attributes.statut);
			setNiveauNumber(11);
			setNiveauCitation(niveaux.data[11].attributes.citation);
			setNiveauCommentaire(niveaux.data[11].attributes.commentaires);
		} else if (points > 1800 && points <= 1950) {
			setNiveauStatut(niveaux.data[12].attributes.statut);
			setNiveauNumber(12);
			setNiveauCitation(niveaux.data[12].attributes.citation);
			setNiveauCommentaire(niveaux.data[12].attributes.commentaires);
		} else if (points > 1950 && points <= 2100) {
			setNiveauStatut(niveaux.data[13].attributes.statut);
			setNiveauNumber(13);
			setNiveauCitation(niveaux.data[13].attributes.citation);
			setNiveauCommentaire(niveaux.data[13].attributes.commentaires);
		} else if (points > 2100 && points <= 2250) {
			setNiveauStatut(niveaux.data[14].attributes.statut);
			setNiveauNumber(14);
			setNiveauCitation(niveaux.data[14].attributes.citation);
			setNiveauCommentaire(niveaux.data[14].attributes.commentaires);
		} else if (points > 2250 && points <= 2400) {
			setNiveauStatut(niveaux.data[15].attributes.statut);
			setNiveauNumber(15);
			setNiveauCitation(niveaux.data[15].attributes.citation);
			setNiveauCommentaire(niveaux.data[15].attributes.commentaires);
		} else if (points > 2400 && points <= 2550) {
			setNiveauStatut(niveaux.data[16].attributes.statut);
			setNiveauNumber(16);
			setNiveauCitation(niveaux.data[16].attributes.citation);
			setNiveauCommentaire(niveaux.data[16].attributes.commentaires);
		} else if (points > 2550 && points <= 2700) {
			setNiveauStatut(niveaux.data[17].attributes.statut);
			setNiveauNumber(17);
			setNiveauCitation(niveaux.data[17].attributes.citation);
			setNiveauCommentaire(niveaux.data[17].attributes.commentaires);
		} else if (points > 2700 && points <= 2850) {
			setNiveauStatut(niveaux.data[18].attributes.statut);
			setNiveauNumber(18);
			setNiveauCitation(niveaux.data[18].attributes.citation);
			setNiveauCommentaire(niveaux.data[18].attributes.commentaires);
		} else if (points > 2850 && points <= 3000) {
			setNiveauStatut(niveaux.data[19].attributes.statut);
			setNiveauNumber(19);
			setNiveauCitation(niveaux.data[19].attributes.citation);
			setNiveauCommentaire(niveaux.data[19].attributes.commentaires);
		} else if (points > 3000 && points <= 3150) {
			setNiveauStatut(niveaux.data[20].attributes.statut);
			setNiveauNumber(20);
			setNiveauCitation(niveaux.data[20].attributes.citation);
			setNiveauCommentaire(niveaux.data[20].attributes.commentaires);
		} else if (points > 3150 && points <= 3300) {
			setNiveauStatut(niveaux.data[21].attributes.statut);
			setNiveauNumber(21);
			setNiveauCitation(niveaux.data[21].attributes.citation);
			setNiveauCommentaire(niveaux.data[21].attributes.commentaires);
		} else if (points > 3300 && points <= 3450) {
			setNiveauStatut(niveaux.data[22].attributes.statut);
			setNiveauNumber(22);
			setNiveauCitation(niveaux.data[22].attributes.citation);
			setNiveauCommentaire(niveaux.data[22].attributes.commentaires);
		} else if (points > 3450 && points <= 3600) {
			setNiveauStatut(niveaux.data[23].attributes.statut);
			setNiveauNumber(23);
			setNiveauCitation(niveaux.data[23].attributes.citation);
			setNiveauCommentaire(niveaux.data[23].attributes.commentaires);
		} else if (points > 3600 && points <= 3750) {
			setNiveauStatut(niveaux.data[24].attributes.statut);
			setNiveauNumber(24);
			setNiveauCitation(niveaux.data[24].attributes.citation);
			setNiveauCommentaire(niveaux.data[24].attributes.commentaires);
		} else if (points > 3750 && points <= 3900) {
			setNiveauStatut(niveaux.data[25].attributes.statut);
			setNiveauNumber(25);
			setNiveauCitation(niveaux.data[25].attributes.citation);
			setNiveauCommentaire(niveaux.data[25].attributes.commentaires);
		} else if (points > 3900 && points <= 4050) {
			setNiveauStatut(niveaux.data[26].attributes.statut);
			setNiveauNumber(26);
			setNiveauCitation(niveaux.data[26].attributes.citation);
			setNiveauCommentaire(niveaux.data[26].attributes.commentaires);
		} else if (points > 4050 && points <= 4200) {
			setNiveauStatut(niveaux.data[27].attributes.statut);
			setNiveauNumber(27);
			setNiveauCitation(niveaux.data[27].attributes.citation);
			setNiveauCommentaire(niveaux.data[27].attributes.commentaires);
		} else if (points > 4200 && points <= 4350) {
			setNiveauStatut(niveaux.data[28].attributes.statut);
			setNiveauNumber(28);
			setNiveauCitation(niveaux.data[28].attributes.citation);
			setNiveauCommentaire(niveaux.data[28].attributes.commentaires);
		} else if (points > 4350 && points <= 4500) {
			setNiveauStatut(niveaux.data[29].attributes.statut);
			setNiveauNumber(29);
			setNiveauCitation(niveaux.data[29].attributes.citation);
			setNiveauCommentaire(niveaux.data[29].attributes.commentaires);
		}
	};

	return (
		<>
			<View style={styles.row}>
				<LinearGradient
					colors={["#D683EF", "#FCA9AC"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.gradientBox}>
					<View style={styles.niveauLabelContainer}>
						<Text style={styles.niveauLabel}>Niveau</Text>
					</View>
					<Text style={styles.niveauNumber}>{niveauNumber}</Text>
				</LinearGradient>

				<View style={styles.niveauStatusBox}>
					<View style={styles.niveauLabelContainer}>
						<Text style={styles.niveauLabel}>Statut</Text>
					</View>
					<Text style={styles.niveauStatus}>{niveauStatut}</Text>
				</View>
			</View>

			<View style={styles.citationContainer}>
				<View>
					<Text style={styles.citationText}>{niveauCitation}</Text>
				</View>
				<View style={styles.scrollViewContainer}>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollViewContent}
						showsVerticalScrollIndicator={false}
						onLayout={(event) =>
							setScrollViewHeight(event.nativeEvent.layout.height)
						}
						onContentSizeChange={(width, height) => setContentHeight(height)}>
						<Text>{niveauCommentaire}</Text>
					</ScrollView>
					{isOverflowing && <View style={styles.bottomShadow} />}
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	gradientBox: {
		width: "48%",
		padding: 10,
		paddingBottom: 0,
		borderRadius: 15,
		alignItems: "flex-end",
		position: "relative",
	},
	niveauLabelContainer: {
		zIndex: 10,
		position: "absolute",
		top: 10,
		left: 10,
	},
	niveauLabel: {
		fontSize: 16,
		fontWeight: "bold",
		color: "white",
	},
	niveauNumber: {
		fontSize: 92,
		fontWeight: "bold",
		color: "white",
	},
	niveauStatusBox: {
		width: "48%",
		padding: 10,
		borderRadius: 15,
		backgroundColor: "black",
		alignItems: "flex-end",
		justifyContent: "flex-end",
	},
	niveauStatus: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
	citationContainer: {
		marginTop: 15,
		backgroundColor: "white",
		padding: 15,
		borderRadius: 15,
	},
	citationText: {
		fontSize: 16,
		fontWeight: "bold",
	},
	scrollView: {
		marginTop: 15,
		maxHeight: 100,
	},
	scrollViewContent: {
		paddingRight: 10,
		paddingBottom: 10,
	},
	scrollViewContainer: {
		overflow: "hidden",
		borderRadius: 10,
	},
	bottomShadow: {
		position: "absolute",
		bottom: -10,
		left: 0,
		right: 0,
		height: 10,
		backgroundColor: "#F0F",
		shadowColor: "rgb(0, 0, 0)",
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.4,
		shadowRadius: 10,
		elevation: 10,
	},
});
