import { colorYellow } from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BlurView } from "expo-blur";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SUBSCRIPTION_MESSAGES = [
	"La version gratuite, c'est bien pour tester. Mais toi t'es pas là pour tester, t'es là pour briller non ? Abonnes-toi",
	"Là, tu te trouves à un carrefour. À gauche, la version gratos pour les amateurs. À droite, l'extase payante pour les pros. Choisis bien ton camp ! Abonne-toi ici",
	"Il y a deux types d'utilisateurs : ceux qui savent, et ceux qui scrollent en freemium. Et si tu changeais de camp ? Abonne-toi ici",
	"IDEM QUE DICO />>>> Pour que ca pousse à scroller (c'est l'option qui me parait la plus pertinente pour découvrir le potentiel)",
	"Pendant que tu lis ça, d'autres profitent déjà du contenu premium. Pas toi. Pas encore. Abonne-toi ici",
	"La version gratos c'est un peu comme regarder une bande-annonce sans jamais voir le film, non ? Allez rejoins-nous vite. Abonne-toi ici",
	"Encore en train d'hésiter pour t'abonner !? Les vrais passent à l'action, les autres restent coincés ici. Abonne-toi ici",
	"T'es à deux doigts d'avoir accès à tout… Mais bon, deux doigts, c'est loin quand on clique pas. Abonne-toi ici",
	"Tu veux de la valeur ? Faut payer. Sinon c'est de l'eau tiède… Abonne-toi ici",
	"On te le dit avec amour : la version gratuite, c'est pour les touristes. Abonne-toi ici",
	"On t'a tout donné… sauf le meilleur. Il est juste derrière ce bouton. Abonne-toi ici",
	"Tu crois que t'as tout vu ? Spoiler : le meilleur est planqué derrière l'abonnement. Abonne-toi ici",
	"On te dit pas de craquer. On te dit juste que si tu savais ce que t'as raté, tu pleurerais un peu. Abonne-toi ici",
	"Fais pas genre t'es satisfait. T'as même pas vu le vrai contenu. Abonne-toi ici",
	"T'imagines à quel point tu te sens limité là ? Bienvenue dans le monde illimité de la version payante, tout le monde t'attend. Abonne-toi ici",
	"Tu veux vraiment rester dans la ligue des petits bras ? Sérieux ? Abonne-toi ici",
	"Si t'étais VIP, tu serais déjà en train de profiter de ça. Tu viens ? Abonne-toi ici",
	"Ce contenu n'est accessible qu'avec la version payante. La version gratuite c'est sympa mais c'est un peu comme un burger sans sauce. Abonne-toi ici",
	"T'es encore là en version gratuite ? Courage… certains s'en sortent. Abonne-toi ici",
	"Tu veux rester pauvre en contenu ou riche en infos ? La réponse est juste là : Abonne-toi ici",
	"Sans la version payante, t'es un peu comme un hamster dans sa roue. Ça tourne, ça s'agite… mais au fond, t'avances pas. Abonne-toi ici",
	"Pendant que tu réfléchis pour t'abonner, les autres avancent. Mais reste là si t'aimes stagner. Ou abonne-toi ici",
	"Freemium, ça sonne cool. Mais dans la vraie vie, c'est juste frustrant.",
	"Encore en train d'hésiter pour t'abonner ? Les vrais passent à l'action, les autres restent coincés ici.",
	"On peut pas t'aider si tu cliques pas pour t'abonner…. Abonne-toi ici",
	"Rester en freemium, c'est comme aller à la plage en chaussettes. Techniquement, t'y es… mais c'est pas pareil.",
	"La version gratuite, c'est comme un apéro sans cacahuètes. Les vrais savent que c'est triste. Abonne-toi ici",
	"Gratuit, c'est comme une pizza sans fromage : ça existe, mais est-ce qu'on a vraiment envie de vivre ça ? Abonne-toi ici",
	"C'est gentil de rester en version gratuite. Ça nous rappelle que certains aiment encore souffrir en silence.",
	"T'imagines un monde où tout le monde est freemium ? Ce serait une armée de gens frustrés qui regardent à travers les vitres. Sois pas dans la vitrine, entre.",
	"T'as du goût, on le sent. Maintenant il te manque juste le menu complet. Abonne-toi ici",
];

const getRandomMessage = () => {
	return SUBSCRIPTION_MESSAGES[
		Math.floor(Math.random() * SUBSCRIPTION_MESSAGES.length)
	];
};

interface LockedVideoOverlayProps {
	onUpgradePress: () => void;
}

export default function LockedVideoOverlay({
	onUpgradePress,
}: LockedVideoOverlayProps) {
	const randomMessage = useMemo(() => getRandomMessage(), []);

	return (
		<BlurView intensity={80} style={styles.lockedOverlay}>
			<View style={styles.lockedContent}>
				<FontAwesome6 name='lock' size={38} color={colorYellow} />
				{/* <Text style={styles.lockedText}>Contenu Premium</Text> */}
				<Text style={styles.messageText}>{randomMessage}</Text>
				<TouchableOpacity
					style={buttonBlack}
					onPress={onUpgradePress}
					activeOpacity={0.8}>
					<Text style={styles.upgradeButtonText}>Passer à Premium</Text>
				</TouchableOpacity>
			</View>
		</BlurView>
	);
}

const styles = StyleSheet.create({
	lockedOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	lockedContent: {
		alignItems: "center",
		padding: 20,
		gap: 20,
		maxWidth: "90%",
	},
	lockIcon: {
		marginBottom: 16,
	},
	lockedText: {
		color: "#FFF",
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
		textAlign: "center",
	},
	messageText: {
		color: "#E0E0E0",
		fontSize: 16,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 24,
	},
	upgradeButton: {
		backgroundColor: "#007AFF",
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 12,
		alignItems: "center",
	},
	upgradeButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
});
