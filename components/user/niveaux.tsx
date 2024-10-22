import useGetNiveaux from "@/hooks/useGetNiveaux";
import useJwtToken from "@/hooks/useJwtToken";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Loader from "../experience/loader";

interface Props {
	totalPoints: number;
}

export default function ShowNiveaux({ totalPoints }: Props) {
	const { token } = useJwtToken();
	const { data: niveaux } = useGetNiveaux(token);

	const [niveauStatut, setNiveauStatut] = useState<string | null>(null);
	const [niveauNumber, setNiveauNumber] = useState<number | null>(null);
	const [niveauCitation, setNiveauCitation] = useState<string | null>(null);
	const [niveauCommentaire, setNiveauCommentaire] = useState<string | null>(
		null
	);

	useEffect(() => {
		if (niveaux) {
			const index = calculateNiveauIndex(totalPoints);
			setNiveauDetails(index);
		}
	}, [niveaux, totalPoints]);

	if (!niveaux) {
		return <Loader />;
	}

	// Calculate the niveau index based on totalPoints
	const calculateNiveauIndex = (points: number): number => {
		return Math.min(Math.floor(points / 150), niveaux.data.length - 1);
	};

	// Set niveau details based on the calculated index
	const setNiveauDetails = (index: number) => {
		const niveau = niveaux.data[index]?.attributes;
		if (niveau) {
			setNiveauStatut(niveau.statut);
			setNiveauNumber(index);
			setNiveauCitation(niveau.citation);
			setNiveauCommentaire(niveau.commentaires);
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
				<View style={styles.commentContainer}>
					<Text>{niveauCommentaire}</Text>
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
	commentContainer: {
		marginTop: 15,
	},
});
