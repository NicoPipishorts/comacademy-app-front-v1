import { colorBlack, colorDarkGrey } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import useGetUserInfo from "@/hooks/userUserInfo";
import useUserId from "@/hooks/useUserId";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Loader from "../experience/loader";
import ScreenHeaders from "../ScreenHeaders";

export default function UserAccount() {
	const { userId } = useUserId();
	const { data: userData } = useGetUserInfo(userId);
	const [formFirstName, setFormFirstName] = useState("");
	const [formLastName, setFormLastName] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

	const toggleShowPassword = (which: string | null) => {
		if (!which) {
			setShowPassword(!showPassword);
		} else {
			setShowPasswordConfirm(!showPasswordConfirm);
		}
	};

	useEffect(() => {
		if (userData && userData.firstName) {
			setFormFirstName(userData.firstName);
		}
		if (userData && userData.lastName) {
			setFormLastName(userData.lastName);
		}
	}, [userData]);

	if (!userData) {
		return <Loader />;
	}
	return (
		<>
			<ScreenHeaders content='Mon Compte' />
			<View style={{ paddingBottom: 20 }}>
				<Text style={{ fontSize: FontSize16 }}>Modifie tes information.</Text>
			</View>
			<View>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						width: "100%",
					}}>
					<View style={styles.passwordInputContainer}>
						<TextInput
							style={[styles.input, { width: "48%" }]}
							onChangeText={setFormFirstName}
							value={formFirstName}
							placeholder={formFirstName ? "" : "Prénom"} // Conditionally render placeholder
							placeholderTextColor={colorBlack}
							autoCapitalize='none'
						/>
					</View>
					<View style={styles.passwordInputContainer}>
						<TextInput
							style={[styles.input, { width: "48%" }]}
							onChangeText={setFormLastName}
							value={formLastName}
							placeholder={formLastName ? formLastName : "Nom"}
							placeholderTextColor={colorBlack}
							autoCapitalize='none'
						/>
					</View>
				</View>

				<View style={styles.passwordInputContainer}>
					<TextInput
						secureTextEntry={!showPassword} // Bind to showPassword state
						value={password}
						onChangeText={setPassword}
						style={styles.input}
						placeholder='Mot de Passe'
						placeholderTextColor={colorBlack}
					/>
					<MaterialCommunityIcons
						name={showPassword ? "eye-off" : "eye"}
						size={24}
						color={colorBlack}
						style={styles.eyeIcon}
						onPress={() => toggleShowPassword(null)}
					/>
				</View>
				<View style={styles.passwordInputContainer}>
					<TextInput
						secureTextEntry={!showPasswordConfirm} // Bind to showPasswordConfirm state
						value={passwordConfirm}
						onChangeText={setPasswordConfirm}
						style={styles.input}
						placeholder='Confirmer Mot de Passe'
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
			</View>
		</>
	);
}

const styles = StyleSheet.create({
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
