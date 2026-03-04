import useGetNiveaux from "@/hooks/useGetNiveaux";
import useJwtToken from "@/hooks/useJwtToken";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import Loader from "../experience/loader";

interface Props {
	totalPoints: number;
}

export default function ShowNiveaux({ totalPoints }: Props) {
	const { token } = useJwtToken();
	const { data: niveaux } = useGetNiveaux(token);

	const niveauxLength = niveaux?.data?.length ?? 0;

	// Calculate the niveau index based on totalPoints
	const calculateNiveauIndex = useCallback(
		(points: number): number => {
			if (!niveauxLength) {
				return 0;
			}
			return Math.min(Math.floor(points / 150), niveauxLength - 1);
		},
		[niveauxLength]
	);

	// Calculate the round index based on totalPoints
	const calculateRoundIndex = useCallback(
		(niveau: number | null, points: number): number => {
			if (niveau === null || niveauxLength === 0) {
				return 0;
			}
			if (niveau === 0) {
				const maxIndex = Math.max(niveauxLength - 1, 0);
				return Math.min(Math.floor(points / 15), maxIndex);
			}
			return Math.max(0, Math.floor((points - niveau * 150) / 15));
		},
		[niveauxLength]
	);

	const niveauNumber = niveauxLength ? calculateNiveauIndex(totalPoints) : null;
	const currentNiveauEntry =
		niveauNumber !== null ? (niveaux?.data?.[niveauNumber] as any) : null;
	const currentNiveau =
		currentNiveauEntry?.attributes ?? currentNiveauEntry ?? null;
	const niveauStatut =
		currentNiveau?.statut ?? currentNiveau?.Statut ?? "—";
	const niveauCitation =
		currentNiveau?.citation ?? currentNiveau?.Citation ?? "—";
	const niveauCommentaire =
		currentNiveau?.commentaires ?? currentNiveau?.Commentaires ?? "—";

	if (!niveaux) {
		return <Loader />;
	}

	return (
		<>
			<View style={styles.row}>
				<LinearGradient
					colors={["#D683EF", "#FCA9AC"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.gradientBox}>
					<View style={[styles.niveauRoundRow, { marginTop: -20 }]}>
						<Text style={[styles.niveauLabel]}>Niveau</Text>
						<Text style={styles.niveauNumber}> {niveauNumber}</Text>
					</View>
					<View style={styles.niveauRoundRow}>
						<Text style={styles.niveauLabel}>Round</Text>
						<Text
							style={[
								styles.niveauNumber,
								{ position: "absolute", right: 15, bottom: -20 },
							]}>
							{calculateRoundIndex(niveauNumber, totalPoints)}
						</Text>
						<Text
							style={[
								styles.niveauNumber,
								{ position: "absolute", right: -4, bottom: 0, fontSize: 14 },
							]}>
							/10
						</Text>
					</View>
				</LinearGradient>

				<View style={styles.niveauStatusBox}>
					<Text style={[styles.niveauLabel, { fontSize: 16 }]}>Statut</Text>
					<Text style={styles.niveauStatus}>{niveauStatut}</Text>
				</View>
			</View>

			<View style={styles.citationContainer}>
				<View>
					<Text style={styles.citationText}>{niveauCitation}</Text>
				</View>
				<View style={[styles.commentContainer, { height: "auto" }]}>
					<Text>{niveauCommentaire}</Text>
				</View>
				{/* <TouchableOpacity onPress={toggleCommentSection} style={{ zIndex: 10 }}>
					<Image
						source={require("@/assets/imgs/icons/chevron-circle.png")}
						style={{
							transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
							position: "absolute",
							bottom: 0,
							right: 5,
							width: 30,
							height: 30,
						}}
					/>
				</TouchableOpacity> */}
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
		flexDirection: "column",
		maxWidth: "48%",
		padding: 10,
		borderRadius: 15,
		justifyContent: "space-evenly",
		aspectRatio: 1,
	},
	niveauRoundRow: {
		position: "relative",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
	},
	niveauLabel: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
	niveauNumber: {
		fontSize: 50,
		color: "white",
		fontWeight: "bold",
		letterSpacing: -2,
	},
	niveauStatusBox: {
		width: "48%",
		padding: 10,
		borderRadius: 15,
		backgroundColor: "black",
		alignItems: "flex-end",
		justifyContent: "space-between",
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
