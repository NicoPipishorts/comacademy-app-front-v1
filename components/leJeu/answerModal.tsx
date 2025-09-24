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
import { truncateString } from "@/helpers/truncateText";
import useAuthSession from "@/hooks/useAuthSession";
import useJwtToken from "@/hooks/useJwtToken";
import { Answer } from "@/types/enums";
import { GameSessionQuestionData } from "@/types/game";
import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Image,
	ImageStyle,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import * as Progress from "react-native-progress";
import SmallCategroieIcons from "../icons/SmallCategroieIcons";

type Props = {
	visible: boolean;
	feedbackMessage: Answer | null;
	setIsModalVisible: Dispatch<SetStateAction<boolean>>;
	currentCardData: GameSessionQuestionData | null;
	favoriteQuestions: number[];
	setFavoriteQuestions: Dispatch<SetStateAction<number[]>>;
};

const AnswerModal = ({
	visible,
	setIsModalVisible,
	currentCardData,
	favoriteQuestions,
	setFavoriteQuestions,
}: Props) => {
	const [progress, setProgress] = useState(0);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const [favorite, setFavorite] = useState<boolean>(false);

	const handleCloseModal = useCallback(() => {
		setIsModalVisible(false);
		setFavorite(false);
	}, [setIsModalVisible, setFavorite]);

	const progressInterval = 100;
	const progressIncrement = 0.01;

	// Define onSuccess and onError handlers
	const handleSuccess = (data: any) => {
		// setFavorite(true);
	};

	const mutation = useAddFavoriteQuestionMutation(handleSuccess);

	// Set favorite status based on the favoriteQuestions array when the modal becomes visible
	useEffect(() => {
		if (visible && currentCardData && favoriteQuestions !== undefined) {
			setFavorite(favoriteQuestions.includes(currentCardData?.id));
		}
	}, [visible, currentCardData, favoriteQuestions]);

	const handleAddFavoriteQuestion = () => {
		if (currentCardData?.id === undefined) return;

		const questionId = currentCardData.id;

		if (favoriteQuestions.includes(questionId)) {
			// Remove from favorites
			const updatedFavoriteQuestions = favoriteQuestions.filter(
				(id) => id !== questionId
			);
			setFavoriteQuestions(updatedFavoriteQuestions);
			setFavorite(false); // Set favorite to false
			mutation.mutate({
				userId: auth?.user.id,
				updatedFavoriteQuestions,
				token,
			});
		} else {
			// Add to favorites
			const updatedFavoriteQuestions = [...favoriteQuestions, questionId];
			setFavoriteQuestions(updatedFavoriteQuestions);
			setFavorite(true); // Set favorite to true
			mutation.mutate({
				userId: auth?.user.id,
				updatedFavoriteQuestions,
				token,
			});
		}
	};

	// Progress bar effect
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
	}, [handleCloseModal, visible]);

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
									{truncateString(currentCardData.attributes.QUESTION, 56)}
								</Text>
							</View>
							<View style={styles.wrapperIcons}>
								<View style={styles.containerIcons}>
									{currentCardData.attributes.CATEGORIE !== undefined &&
									currentCardData.attributes.CATEGORIE !== null ? (
										<View style={{ marginRight: 8 }}>
											<SmallCategroieIcons
												key={currentCardData.attributes.CATEGORIE}
												cats={currentCardData.attributes.CATEGORIE}
											/>
										</View>
									) : (
										""
									)}
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
							<View style={styles.wrapperAnswers}>
								<ScrollView
									style={styles.containerAnswer}
									showsVerticalScrollIndicator={false}>
									<Text style={styles.textAnswer}>
										{currentCardData.attributes.REPONSE}
									</Text>
								</ScrollView>
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
		paddingTop: 40,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		alignItems: "center",
	},
	headerContainer: {
		width: "100%",
		paddingHorizontal: 10,
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
	wrapperAnswers: {
		padding: 20,
		width: "100%",
		backgroundColor: colorWhite,
		borderRadius: 15,
		maxHeight: "52%",
	},
	containerAnswer: {
		flexGrow: 0,
		width: "100%",
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
