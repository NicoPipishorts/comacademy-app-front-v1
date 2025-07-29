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

	// const [textHeight, setTextHeight] = useState<number | "auto">(40);
	// const [isExpanded, setIsExpanded] = useState(false); // Track expansion state
	const [niveauStatut, setNiveauStatut] = useState<string | null>(null);
	const [niveauNumber, setNiveauNumber] = useState<number | null>(null);
	const [niveauCitation, setNiveauCitation] = useState<string | null>(null);
	const [niveauCommentaire, setNiveauCommentaire] = useState<string | null>(
		null
	);

	// Calculate the niveau index based on totalPoints
	const calculateNiveauIndex = (points: number): number => {
		return Math.min(Math.floor(points / 150), niveaux.data.length - 1);
	};

	// Calculate the round index based on totalPoints
	const calculateRoundIndex = (niveau: number, points: number): number => {
		if (niveau === 0) {
			return Math.min(Math.floor(points / 15), niveaux.data.length - 1);
		} else {
			return Math.floor((points - niveau * 150) / 15);
		}
	};

	useEffect(() => {
		if (niveaux) {
			const index = calculateNiveauIndex(totalPoints);
			setNiveauDetails(index);
		}
	}, [niveaux, totalPoints]);

	if (!niveaux) {
		return <Loader />;
	}

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

	// const toggleCommentSection = () => {
	// 	LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
	// 	if (isExpanded) {
	// 		setTextHeight(40);
	// 	} else {
	// 		setTextHeight("auto");
	// 	}
	// 	setIsExpanded(!isExpanded);
	// };

	return (
		<>
			<View style={styles.row}>
				<LinearGradient
					colors={["#D683EF", "#FCA9AC"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.gradientBox}>
					<View style={styles.niveauRoundRow}>
						<Text style={[styles.niveauLabel]}>Niveau</Text>
						<Text style={[styles.niveauNumber, { fontSize: 62 }]}>
							{niveauNumber}
						</Text>
					</View>
					<View style={styles.niveauRoundRow}>
						<Text style={styles.niveauLabel}>Round</Text>
						<Text style={styles.niveauNumber}>
							{calculateRoundIndex(niveauNumber, totalPoints)}
						</Text>
					</View>
				</LinearGradient>

				<View style={styles.niveauStatusBox}>
					<Text style={styles.niveauLabel}>Statut</Text>
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
		paddingHorizontal: 10,
		borderRadius: 15,
		justifyContent: "space-evenly",
		aspectRatio: 1,
	},
	niveauRoundRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
	},
	niveauLabel: {
		fontSize: 18,
		fontWeight: "bold",
		color: "white",
	},
	niveauNumber: {
		fontSize: 34,
		color: "white",
		fontWeight: "bold",
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
