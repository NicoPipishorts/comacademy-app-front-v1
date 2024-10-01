import { colorBlack, colorDarkGrey, colorWhite } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useChangeUserInfo from "@/hooks/useChangeUserInfo";
import useGetUserInfo from "@/hooks/userUserInfo";
import useUserId from "@/hooks/useUserId";
import { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Loader from "../experience/loader";
import ScreenHeaders from "../ScreenHeaders";

export default function UserAccount() {
	const { userId } = useUserId();
	const { data: userData } = useGetUserInfo(userId);
	const [formFirstName, setFormFirstName] = useState("");
	const [formLastName, setFormLastName] = useState("");
	// const [currentPassword, setCurrentPassword] = useState("");
	// const [newPassword, setNewPassword] = useState("");
	// const [passwordConfirm, setPasswordConfirm] = useState("");
	// const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	// const [showNewPassword, setShowNewPassword] = useState(false);
	// const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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

	// const changePassword = usePasswordChange();
	// const handleChangePassword = () => {
	// 	if (newPassword === passwordConfirm) {
	// 		if (newPassword !== currentPassword) {
	// 			changePassword.mutate({
	// 				currentPassword: currentPassword,
	// 				newPassword: passwordConfirm,
	// 			});
	// 		} else {
	// 			console.log("the new password is the same as the old");
	// 		}
	// 	} else {
	// 		console.log("the two passwords don't match");
	// 	}
	// };

	// const toggleShowPassword = (field: string) => {
	// 	if (field === "current") {
	// 		setShowCurrentPassword(!showCurrentPassword);
	// 	} else if (field === "new") {
	// 		setShowNewPassword(!showNewPassword);
	// 	} else if (field === "confirm") {
	// 		setShowPasswordConfirm(!showPasswordConfirm);
	// 	}
	// };

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

			{/* <View style={styles.passwordContainer}>
				<View style={{ paddingTop: 40, paddingBottom: 20 }}>
					<Text style={{ fontSize: FontSize16 }}>
						Modifie ton mot de passe.
					</Text>
				</View>

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

				<TouchableOpacity
					onPress={() => handleChangePassword()}
					style={styles.buttons}
					disabled>
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
