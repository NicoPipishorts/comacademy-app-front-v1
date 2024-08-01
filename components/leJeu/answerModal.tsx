import { useAddFavoriteQuestionMutation } from "@/api/favoriteQuestion";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Plus from "@/assets/imgs/icons/plus.png";
import {
	colorBlack,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import { FontSize16, FontSizeScreenTitles } from "@/constants/fontsizes";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { Answer } from "@/types/enums";
import { GameData } from "@/types/game";
import React, {
	Dispatch,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Image,
	ImageStyle,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import * as Progress from "react-native-progress";
import SmallCategroieIcons from "../SmallCategroieIcons";

type Props = {
	visible: boolean;
	feedbackMessage: Answer | null;
	setIsModalVisible: Dispatch<SetStateAction<boolean>>;
	currentCardData: GameData | null;
};

const AnswerModal = ({
	visible,
	setIsModalVisible,
	currentCardData,
}: Props) => {
	const [progress, setProgress] = useState(0);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const [favorite, setFavorite] = useState<boolean>(false);

	const handleCloseModal = () => {
		setIsModalVisible(false);
		setFavorite(false);
	};

	const progressInterval = 100;
	const progressIncrement = 0.01;

	const questionId: number | undefined = currentCardData?.id;

	// Define onSuccess and onError handlers
	const handleSuccess = (data: any) => {
		console.log("Successfully added to favorites!");
		setFavorite(true);
	};

	const handleError = (error: any) => {
		console.error("Error adding favorite question", error);
	};

	// Use the custom hook
	const mutation = useAddFavoriteQuestionMutation(handleSuccess, handleError);

	const handleAddFavoriteQuestion = () => {
		mutation.mutate({ userId, questionId, token });
	};

	useEffect(() => {
		if (visible) {
			const startProgress = () => {
				setProgress(0);
				timerRef.current = setInterval(() => {
					setProgress((prev) => {
						if (prev >= 1) {
							if (timerRef.current) {
								clearInterval(timerRef.current);
							}
							// Delay the state update until after the render phase
							setTimeout(() => {
								handleCloseModal();
								setFavorite(false);
							}, 0);
							return 1;
						}
						return prev + progressIncrement;
					});
				}, progressInterval);
			};
			startProgress();
			return () => {
				if (timerRef.current) {
					clearInterval(timerRef.current);
				}
			};
		}
		// Return undefined if visible is false to ensure all code paths return a value
		return undefined;
	}, [visible, progressIncrement, progressInterval, setFavorite]);

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType='slide'
			onRequestClose={handleCloseModal}>
			<View style={styles.modalContainer}>
				<View style={styles.modalContent}>
					{currentCardData && (
						<>
							<View style={styles.headerContainer}>
								<Text style={styles.headerMainText}>
									{currentCardData.attributes.QUESTION}
								</Text>
							</View>
							<View style={styles.wrapperIcons}>
								<View style={styles.containerIcons}>
									{currentCardData.attributes.CATEGORIE !== undefined &&
									currentCardData.attributes.CATEGORIE !== null
										? currentCardData.attributes.CATEGORIE.map((cat) => {
												const categoryNumber = cat;
												return (
													<SmallCategroieIcons
														key={categoryNumber}
														cats={categoryNumber}
													/>
												);
										  })
										: ""}
								</View>
								<View style={styles.containerIcons}>
									<Image
										source={Plus}
										style={[styles.catIcons, { marginRight: 20 }] as ImageStyle}
										resizeMode='contain'
									/>
									<TouchableOpacity onPress={handleAddFavoriteQuestion}>
										<Image
											source={favorite ? HeartFull : Heart}
											style={styles.catIcons as ImageStyle}
											resizeMode='contain'
										/>
									</TouchableOpacity>
								</View>
							</View>
							<View style={styles.containerAnswer}>
								<Text style={styles.textAnswer}>
									{currentCardData.attributes.REPONSE}
								</Text>
							</View>
						</>
					)}
					<View style={styles.progressBarContainer}>
						<Progress.Bar
							progress={progress}
							width={null}
							height={6}
							color={colorYellow}
							borderRadius={10}
						/>
					</View>
					<View style={styles.closeButtonContainer}>
						<TouchableOpacity
							onPress={handleCloseModal}
							style={styles.closeButton}>
							<Text style={styles.closeButtonText}>Fermer</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		width: "100%",
		height: "90%",
		backgroundColor: primaryBackground,
		padding: 20,
		paddingTop: 50,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		alignItems: "center",
	},
	headerContainer: {
		width: "100%",
		paddingHorizontal: 20,
		marginBottom: 30,
	},
	headerMainText: {
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
	},
	wrapperIcons: {
		paddingHorizontal: 20,
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	containerIcons: {
		flexDirection: "row",
		marginBottom: 30,
	},
	catIcons: {
		width: 24,
		height: 24,
		aspectRatio: 1,
		marginRight: 5,
	},
	containerAnswer: {
		width: "100%",
		backgroundColor: colorWhite,
		padding: 20,
		borderRadius: 15,
	},
	textAnswer: {
		fontSize: FontSize16,
		fontWeight: "bold",
		lineHeight: 25,
	},
	progressBarContainer: {
		position: "absolute",
		bottom: 50,
		width: "90%",
	},
	closeButtonContainer: {
		position: "absolute",
		bottom: 80,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
	},
	closeButton: {
		paddingHorizontal: 30,
		paddingVertical: 10,
		backgroundColor: colorBlack,
		borderRadius: 50,
	},
	closeButtonText: {
		fontSize: 18,
		fontWeight: "bold",
		color: colorWhite,
	},
});

export default AnswerModal;
