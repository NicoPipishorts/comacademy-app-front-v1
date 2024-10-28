import { usePasswordChange } from "@/api/passwordChange";
import {
	colorBlack,
	colorDarkGrey,
	colorRed,
	colorWhite,
} from "@/constants/colors";
import { FontSize14, FontSize16, FontSize18 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import useJwtToken from "@/hooks/useJwtToken";
import useGetUserInfo from "@/hooks/userUserInfo";
import useUserId from "@/hooks/useUserId";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Loader from "../experience/loader";

export default function UserAccount() {
	const { token } = useJwtToken();
	const { userId } = useUserId();
	const { data: userData } = useGetUserInfo(userId);
	// const [formFirstName, setFormFirstName] = useState<string>("");
	// const [formLastName, setFormLastName] = useState<string>("");
	const [currentPassword, setCurrentPassword] = useState<string>("");
	const [newPassword, setNewPassword] = useState<string>("");
	const [passwordConfirm, setPasswordConfirm] = useState<string>("");
	const [showCurrentPassword, setShowCurrentPassword] =
		useState<boolean>(false);
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
	const [showPasswordConfirm, setShowPasswordConfirm] =
		useState<boolean>(false);
	const [passwordChanged, setPasswordChanged] = useState<boolean>(false);
	const [passwordErrors, setPasswordError] = useState<string>(null);

	const showSnackbar = useSnackbar(); // Use the snackbar context

	// useEffect(() => {
	// 	if (userData && userData.firstName) {
	// 		setFormFirstName(userData.firstName);
	// 	}
	// 	if (userData && userData.lastName) {
	// 		setFormLastName(userData.lastName);
	// 	}
	// }, [userData]);

	// const changeInfo = useChangeUserInfo();

	// const handleChangeInfo = () => {
	// 	changeInfo.mutate({
	// 		userId,
	// 		firstName: formFirstName,
	// 		lastName: formLastName,
	// 	});
	// };

	const onPasswordChangeSuccess = () => {
		setCurrentPassword(null);
		setNewPassword(null);
		setPasswordConfirm(null);
		setPasswordChanged(true);
		setPasswordError(null);
		showSnackbar("Mot de passe changé", "success");
	};

	const onPasswordChangeError = (message: string) => {
		showSnackbar(message, "error");
	};

	useEffect(() => {
		if (passwordChanged) {
			const timer = setTimeout(() => {
				setPasswordChanged(false);
			}, 5000);

			return () => clearTimeout(timer);
		}

		return undefined;
	}, [passwordChanged]);

	const changePassword = usePasswordChange(
		onPasswordChangeSuccess,
		onPasswordChangeError
	);

	const handleChangePassword = () => {
		const passwordValidation = (password) => {
			const minLength = /.{8,}/;
			const hasNumbersAndLetters = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
			const hasSpecialChar = /[!@#$%^&*(),._?":{}|<>]/;

			if (!minLength.test(password)) {
				setPasswordError(
					"Le mot de passe doit comporter au moins 8 caractères"
				);
				return false;
			}
			if (!hasNumbersAndLetters.test(password)) {
				setPasswordError(
					"Le mot de passe doit contenir à la fois des lettres et des chiffres"
				);
				console.log("");
				return false;
			}
			if (!hasSpecialChar.test(password)) {
				setPasswordError(
					"Le mot de passe doit contenir au moins un caractère spécial"
				);
				return false;
			}
			return true;
		};

		if (newPassword === passwordConfirm) {
			if (newPassword !== currentPassword) {
				if (passwordValidation(newPassword)) {
					changePassword.mutate({
						currentPassword: currentPassword,
						password: newPassword,
						passwordConfirmation: passwordConfirm,
						token,
					});
				}
			} else {
				setPasswordError("Le nouveau mot de passe est le même que l'ancien");
			}
		} else {
			setPasswordError("Les deux mots de passe ne correspondent pas");
		}
	};

	const toggleShowPassword = (field) => {
		if (field === "current") {
			setShowCurrentPassword(!showCurrentPassword);
		} else if (field === "new") {
			setShowNewPassword(!showNewPassword);
		} else if (field === "confirm") {
			setShowPasswordConfirm(!showPasswordConfirm);
		}
	};

	if (!userData) {
		return <Loader />;
	}
	return (
		<>
			{/* <View style={styles.formsContainers}>
				<View style={{ paddingBottom: 20 }}>
					<Text style={styles.infoSmallTitles}>Tes informations.</Text>
				</View>

				<View>
					<View style={styles.passwordInputContainer}>
						<TextInput
							style={[styles.input, { width: "100%" }]}
							onChangeText={setFormFirstName}
							value={formFirstName}
							placeholder={formFirstName ? "" : "Prénom"} // Conditionally render placeholder
							placeholderTextColor={colorBlack}
							autoCapitalize='none'
						/>
					</View>
					<View style={styles.passwordInputContainer}>
						<TextInput
							style={[styles.input, { width: "100%" }]}
							onChangeText={setFormLastName}
							value={formLastName}
							placeholder={formLastName ? formLastName : "Nom"}
							placeholderTextColor={colorBlack}
							autoCapitalize='none'
						/>
					</View>
				</View>

				<TouchableOpacity
					style={styles.buttons}
					onPress={() => handleChangeInfo()}>
					<Text
						style={{
							color: colorWhite,
							fontSize: FontSize16,
							fontWeight: "bold",
						}}>
						Valider
					</Text>
				</TouchableOpacity>
			</View> */}

			<View style={styles.formsContainers}>
				<View style={{ paddingBottom: 20 }}>
					<Text style={styles.infoSmallTitles}>Mot de Passe</Text>
				</View>

				{passwordErrors && (
					<View
						style={{
							paddingHorizontal: 10,
							paddingVertical: 5,
							borderColor: colorRed,
							borderStyle: "dashed",
							borderWidth: 1,
							borderRadius: 10,
							marginVertical: 25,
							minWidth: "100%",
						}}>
						<Text
							style={{
								color: colorRed,
								fontSize: FontSize14,
								fontWeight: "bold",
							}}>
							{passwordErrors}
						</Text>
					</View>
				)}

				<View style={styles.passwordInputContainer}>
					<TextInput
						secureTextEntry={!showCurrentPassword} // Bind to showCurrentPassword state
						value={currentPassword}
						onChangeText={setCurrentPassword}
						style={styles.input}
						placeholder='Ancien Mot de Passe'
						placeholderTextColor={colorBlack}
					/>
					<MaterialCommunityIcons
						name={showCurrentPassword ? "eye-off" : "eye"}
						size={24}
						color={colorBlack}
						style={styles.eyeIcon}
						onPress={() => toggleShowPassword("current")}
					/>
				</View>

				<View style={styles.passwordInputContainer}>
					<TextInput
						secureTextEntry={!showNewPassword} // Bind to showNewPassword state
						value={newPassword}
						onChangeText={setNewPassword}
						style={styles.input}
						placeholder='Nouveau Mot de Passe'
						placeholderTextColor={colorBlack}
					/>
					<MaterialCommunityIcons
						name={showNewPassword ? "eye-off" : "eye"}
						size={24}
						color={colorBlack}
						style={styles.eyeIcon}
						onPress={() => toggleShowPassword("new")}
					/>
				</View>

				<View style={styles.passwordInputContainer}>
					<TextInput
						secureTextEntry={!showPasswordConfirm} // Bind to showPasswordConfirm state
						value={passwordConfirm}
						onChangeText={setPasswordConfirm}
						style={styles.input}
						placeholder='Confirmer le Mot de Passe'
						placeholderTextColor={colorBlack}
					/>
					<MaterialCommunityIcons
						name={showPasswordConfirm ? "eye-off" : "eye"}
						size={24}
						color={colorBlack}
						style={styles.eyeIcon}
						onPress={() => toggleShowPassword("confirm")}
					/>
				</View>

				<Pressable
					onPress={() => handleChangePassword()}
					style={styles.buttons}>
					<Text
						style={{
							color: colorWhite,
							fontSize: FontSize16,
							fontWeight: "bold",
						}}>
						Modifier
					</Text>
				</Pressable>
				{/* </>
				)} */}
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	formsContainers: {
		display: "flex",
		justifyContent: "center",
		alignItems: "flex-start",
		marginTop: 35,
	},
	passwordInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
		borderWidth: 0,
		paddingBottom: 16,
		borderBottomWidth: 2,
		borderBottomColor: colorDarkGrey,
	},
	buttons: {
		backgroundColor: colorBlack,
		marginBottom: 20,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
	input: {
		flexGrow: 1,
		backgroundColor: "transparent",
		color: colorBlack,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	eyeIcon: {
		marginLeft: 10,
	},
	infoSmallTitles: {
		fontSize: FontSize18,
		fontWeight: "bold",
	},
});
