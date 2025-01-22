import useGetNiveaux from "@/hooks/useGetNiveaux";
import useJwtToken from "@/hooks/useJwtToken";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
	Image,
	LayoutAnimation,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Loader from "../experience/loader";

interface Props {
	totalPoints: number;
}

export default function ShowNiveaux({ totalPoints }: Props) {
	const { token } = useJwtToken();
	const { data: niveaux } = useGetNiveaux(token);

	const [textHeight, setTextHeight] = useState<number | "auto">(40);
	const [isExpanded, setIsExpanded] = useState(false); // Track expansion state
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

	const toggleCommentSection = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		if (isExpanded) {
			setTextHeight(40); // Collapse the comment section
		} else {
			setTextHeight("auto"); // Expand the comment section
		}
		setIsExpanded(!isExpanded); // Toggle the expansion state
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
				<View style={[styles.commentContainer, { height: textHeight }]}>
					<Text>{niveauCommentaire}</Text>
				</View>
				<TouchableOpacity onPress={toggleCommentSection} style={{ zIndex: 10 }}>
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
				</TouchableOpacity>
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
