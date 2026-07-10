import {
	colorBlack,
	colorDarkGrey,
	colorGrey,
	colorRed,
	colorWhite,
} from "@/constants/colors";
import { FontSize12, FontSize16, FontSize18 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import useJwtToken from "@/hooks/useJwtToken";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Loader from "../experience/loader";

const NAME_ALLOWED_CHAR_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const NAME_INVALID_CHAR_REGEX = /[^A-Za-zÀ-ÖØ-öø-ÿ' -]/;
const USERNAME_ALLOWED_CHAR_REGEX = /^[A-Za-z0-9._-]+$/;
const USERNAME_INVALID_CHAR_REGEX = /[^A-Za-z0-9._-]/;

type UserUpdatePayload = {
	firstName: string;
	lastName: string;
	username: string;
};

export default function UserAccount() {
	const showSnackbar = useSnackbar();
	const { token } = useJwtToken();
	const { auth } = useAuthSession();
	const { data: userData } = useGetUserInfo(auth?.user.id);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [username, setUsername] = useState("");
	const [errors, setErrors] = useState<{
		firstName?: string;
		lastName?: string;
		username?: string;
	}>({});
	const [initialisedUserId, setInitialisedUserId] = useState<number | null>(
		null,
	);

	useEffect(() => {
		if (!userData) return;
		if (initialisedUserId === userData.id) return;

		setFirstName(userData.firstName || "");
		setLastName(userData.lastName || "");
		setUsername(userData.username || "");
		setInitialisedUserId(userData.id);
	}, [initialisedUserId, userData]);

	const updateUserInfo = useMutation<void, Error, UserUpdatePayload>({
		mutationFn: async (payload) => {
			if (!token || !auth?.user?.id) {
				throw new Error("Session invalide. Reconnectez-vous.");
			}

			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/users/${auth.user.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				let message = "Impossible de mettre à jour le profil.";
				try {
					const payloadError = await response.json();
					const nested = payloadError?.error?.message;
					const top = payloadError?.message;
					const details = payloadError?.error?.details?.errors?.[0]?.message;
					const backendMessage =
						typeof nested === "string" && nested.trim().length > 0
							? nested
							: typeof top === "string" && top.trim().length > 0
								? top
								: typeof details === "string" && details.trim().length > 0
									? details
									: null;
					if (backendMessage) {
						message = backendMessage;
					}
				} catch {
					// Keep fallback message.
				}
				throw new Error(message);
			}
		},
		onSuccess: () => {
			showSnackbar("Informations du compte mises à jour.", "success");
			void queryClient.invalidateQueries({ queryKey: ["UserInfo"] });
			void queryClient.invalidateQueries({
				queryKey: ["UserPreferences"],
			});
		},
		onError: (error) => {
			showSnackbar(
				error.message || "Impossible de mettre à jour le profil.",
				"error",
			);
		},
	});

	const validateForm = () => {
		const cleanFirstName = firstName.trim();
		const cleanLastName = lastName.trim();
		const cleanUsername = username.trim();
		const nextErrors: {
			firstName?: string;
			lastName?: string;
			username?: string;
		} = {};

		if (!cleanFirstName) {
			nextErrors.firstName = "Le prénom est requis.";
		} else if (!NAME_ALLOWED_CHAR_REGEX.test(cleanFirstName)) {
			const invalidChar = cleanFirstName.match(NAME_INVALID_CHAR_REGEX)?.[0];
			nextErrors.firstName = invalidChar
				? `Caractère non autorisé: "${invalidChar}".`
				: "Caractères autorisés: lettres, apostrophes, espaces et tirets.";
		}

		if (!cleanLastName) {
			nextErrors.lastName = "Le nom est requis.";
		} else if (!NAME_ALLOWED_CHAR_REGEX.test(cleanLastName)) {
			const invalidChar = cleanLastName.match(NAME_INVALID_CHAR_REGEX)?.[0];
			nextErrors.lastName = invalidChar
				? `Caractère non autorisé: "${invalidChar}".`
				: "Caractères autorisés: lettres, apostrophes, espaces et tirets.";
		}

		if (!cleanUsername) {
			nextErrors.username = "Le pseudo est requis.";
		} else if (cleanUsername.length < 3) {
			nextErrors.username = "Le pseudo doit contenir au moins 3 caractères.";
		} else if (!USERNAME_ALLOWED_CHAR_REGEX.test(cleanUsername)) {
			const invalidChar = cleanUsername.match(USERNAME_INVALID_CHAR_REGEX)?.[0];
			nextErrors.username = invalidChar
				? `Caractère non autorisé: "${invalidChar}".`
				: "Caractères autorisés: lettres, chiffres, point, underscore et tiret.";
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSaveUserInfo = () => {
		if (!validateForm()) {
			return;
		}

		updateUserInfo.mutate({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			username: username.trim(),
		});
	};

	const isUnchanged = useMemo(() => {
		if (!userData) return true;
		return (
			firstName.trim() === (userData.firstName || "") &&
			lastName.trim() === (userData.lastName || "") &&
			username.trim() === (userData.username || "")
		);
	}, [firstName, lastName, userData, username]);

	if (!userData) {
		return <Loader />;
	}

	return (
		<>
			<View style={styles.sectionContainer}>
				<Text style={styles.sectionTitle}>Informations du compte</Text>

				<View style={styles.fieldWrapper}>
					<View
						style={[
							styles.inputField,
							errors.firstName ? styles.inputFieldError : undefined,
						]}>
						<TextInput
							value={firstName}
							onChangeText={setFirstName}
							style={styles.input}
							placeholder='Prénom'
							placeholderTextColor={colorBlack}
							autoCapitalize='words'
							returnKeyType='next'
						/>
					</View>
					{errors.firstName ? (
						<Text style={styles.errorText}>{errors.firstName}</Text>
					) : null}
				</View>

				<View style={styles.fieldWrapper}>
					<View
						style={[
							styles.inputField,
							errors.lastName ? styles.inputFieldError : undefined,
						]}>
						<TextInput
							value={lastName}
							onChangeText={setLastName}
							style={styles.input}
							placeholder='Nom'
							placeholderTextColor={colorBlack}
							autoCapitalize='words'
							returnKeyType='next'
						/>
					</View>
					{errors.lastName ? (
						<Text style={styles.errorText}>{errors.lastName}</Text>
					) : null}
				</View>

				<View style={styles.fieldWrapper}>
					<View
						style={[
							styles.inputField,
							errors.username ? styles.inputFieldError : undefined,
						]}>
						<TextInput
							value={username}
							onChangeText={setUsername}
							style={styles.input}
							placeholder='Pseudo'
							placeholderTextColor={colorBlack}
							autoCapitalize='none'
						/>
					</View>
					{errors.username ? (
						<Text style={styles.errorText}>{errors.username}</Text>
					) : null}
				</View>

				<Pressable
					onPress={handleSaveUserInfo}
					style={[
						styles.primaryButton,
						(isUnchanged || updateUserInfo.isPending) &&
							styles.primaryButtonDisabled,
					]}
					disabled={isUnchanged || updateUserInfo.isPending}>
					<Text style={styles.primaryButtonText}>
						{updateUserInfo.isPending ? "Enregistrement..." : "Enregistrer"}
					</Text>
				</Pressable>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	sectionContainer: {
		marginTop: 40,
	},
	sectionTitle: {
		fontSize: FontSize18,
		fontWeight: "bold",
		color: colorBlack,
		marginBottom: 16,
	},
	fieldWrapper: {
		marginBottom: 14,
	},
	inputField: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		minHeight: 58,
		borderRadius: 14,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: colorGrey,
		backgroundColor: "#F5F5F5",
	},
	inputFieldError: {
		borderColor: colorRed,
	},
	input: {
		backgroundColor: "transparent",
		flex: 1,
		paddingVertical: 14,
		color: colorBlack,
		fontSize: FontSize16,
		fontWeight: "700",
	},
	errorText: {
		color: colorRed,
		fontSize: FontSize12,
		marginTop: 4,
		fontWeight: "bold",
	},
	primaryButton: {
		backgroundColor: colorBlack,
		marginTop: 10,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
		alignSelf: "flex-start",
	},
	primaryButtonDisabled: {
		opacity: 0.6,
	},
	primaryButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	sectionHelperText: {
		fontSize: FontSize12,
		color: colorDarkGrey,
		marginTop: 2,
	},
});
