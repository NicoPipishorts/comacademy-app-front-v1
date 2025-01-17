import FeedCard10Commandements from "@/components/cards/feed/Card10Commandements";
import FeedCard3Secrets from "@/components/cards/feed/Card3Secrets";
import FeedCardArgh from "@/components/cards/feed/CardArgh";
import FeedCardCitations from "@/components/cards/feed/CardCitations";
import FeedCardDico from "@/components/cards/feed/CardDico";
import FeedCardImage from "@/components/cards/feed/CardImage";
import FeedCardJeu from "@/components/cards/feed/CardJeu";
import FeedCardMetier from "@/components/cards/feed/CardMetier";
import FeedCardNumber from "@/components/cards/feed/CardNumber";
import FeedCardVie from "@/components/cards/feed/CardVie";
import { FeedItem } from "@/types/feed";
import React from "react";

const CardRenderer = ({
	type,
	data,
	elementId,
}: {
	type: string;
	data: FeedItem;
	elementId: number;
}) => {
	const cardMap: { [key: string]: JSX.Element } = {
		citation: <FeedCardCitations data={data} elementId={elementId} />,
		commandement: <FeedCard10Commandements data={data} elementId={elementId} />,
		dico: <FeedCardDico data={data} elementId={elementId} />,
		question: <FeedCardJeu data={data} elementId={elementId} />,
		secret: <FeedCard3Secrets data={data} elementId={elementId} />,
		metier: <FeedCardMetier data={data} elementId={elementId} />,
		"feed-post-chiffre": <FeedCardNumber data={data} elementId={elementId} />,
		"feed-post-argh": <FeedCardArgh data={data} elementId={elementId} />,
		"feed-post-image": <FeedCardImage data={data} elementId={elementId} />,
		"feed-post-vie": <FeedCardVie data={data} elementId={elementId} />,
	};

	const displayCard = () => {
		if (type === "feed-post") {
			const iconType = data.payload.Type;
			if (!iconType) {
				return null;
			}
			return cardMap[`${type}-${iconType}`] || null;
		} else {
			return cardMap[`${type}`] || null;
		}
	};

	return displayCard();
};

export default CardRenderer;
