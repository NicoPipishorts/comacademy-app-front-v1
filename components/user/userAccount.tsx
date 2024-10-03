import { usePasswordChange } from "@/api/passwordChange";
import { colorBlack, colorDarkGrey, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import useChangeUserInfo from "@/hooks/useChangeUserInfo";
import useJwtToken from "@/hooks/useJwtToken";
import useGetUserInfo from "@/hooks/userUserInfo";
import useUserId from "@/hooks/useUserId";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Loader from "../experience/loader";
import ScreenHeaders from "../ScreenHeaders";

export default function UserAccount() {
	const { token } = useJwtToken();
	const { userId } = useUserId();
	const { data: userData } = useGetUserInfo(userId);
	const [formFirstName, setFormFirstName] = useState("");
	const [formLastName, setFormLastName] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
	const [passwordChanged, setPasswordChanged] = useState(false);

	const showSnackbar = useSnackbar(); // Use the snackbar context

	useEffect(() => {
		if (userData && userData.firstName) {
			setFormFirstName(userData.firstName);
		}
		if (userData && userData.lastName) {
			setFormLastName(userData.lastName);
		}
	}, [userData]);

	const changeInfo = useChangeUserInfo();
	const handleChangeInfo = () => {
		changeInfo.mutate({
			userId,
			firstName: formFirstName,
			lastName: formLastName,
		});
	};

	const onPasswordChangeSuccess = () => {
		setCurrentPassword(null);
		setNewPassword(null);
		setPasswordConfirm(null);
		setPasswordChanged(true);
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
		console.log("clicking change password");
		if (newPassword === passwordConfirm) {
			if (newPassword !== currentPassword) {
				changePassword.mutate({
					currentPassword: currentPassword,
					password: newPassword,
					passwordConfirmation: passwordConfirm,
					token,
				});
			} else {
				console.log("the new password is the same as the old");
			}
		} else {
			console.log("the two passwords don't match");
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
			<ScreenHeaders content='Mon Compte' type='h2' />

			<View style={styles.passwordContainer}>
				<View style={{ paddingBottom: 20 }}>
					<Text style={{ fontSize: FontSize16 }}>
						Modifie tes informations.
					</Text>
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
			</View>

			<View style={styles.passwordContainer}>
				<View style={{ paddingTop: 40, paddingBottom: 20 }}>
					<Text style={{ fontSize: FontSize16 }}>Change ton mot de passe.</Text>
				</View>
				{/* {passwordChanged && (
					<View
						style={{
							alignItems: "center",
							borderColor: colorGreen,
							borderWidth: 2,
							padding: 20,
							borderRadius: 15,
						}}>
						<Text
							style={{
								color: colorGreen,
								fontSize: FontSizeH3,
								fontWeight: "bold",
								textTransform: "uppercase",
							}}>
							mot passe changé
						</Text>
					</View>
				)} */}

				{/* {!passwordChanged && (
					<> */}
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
	passwordContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "flex-start",
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
});
function showSnackbar(arg0: string) {
	throw new Error("Function not implemented.");
}
