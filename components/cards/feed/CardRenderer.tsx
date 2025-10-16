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
import React, { JSX } from "react";
import FeedCardActusBref from "./CardActusBref";
import FeedCardCardComAcademy from "./CardComAcademy";
import FeedCardCultureCom from "./CardCultureCom";
import FeedCardLol from "./CardLol";
import FeedCardVideo from "./CardVideo";

const CardRenderer = ({
	type,
	data,
	elementId,
	visibleItems,
}: {
	type: string;
	data: FeedItem;
	elementId: number;
	visibleItems: number[];
}) => {
	const cardMap: { [key: string]: JSX.Element } = {
		citation: <FeedCardCitations data={data} elementId={elementId} />,
		commandement: <FeedCard10Commandements data={data} elementId={elementId} />,
		dico: <FeedCardDico data={data} elementId={elementId} />,
		question: <FeedCardJeu data={data} elementId={elementId} />,
		secret: <FeedCard3Secrets data={data} elementId={elementId} />,
		metier: <FeedCardMetier data={data} elementId={elementId} />,
		chiffre: <FeedCardNumber data={data} elementId={elementId} />,
		argh: <FeedCardArgh data={data} elementId={elementId} />,
		image: <FeedCardImage data={data} elementId={elementId} />,
		vie: <FeedCardVie data={data} elementId={elementId} />,
		lol: <FeedCardLol data={data} elementId={elementId} />,
		marqueMystere: (
			<FeedCardVideo
				data={data}
				elementId={elementId}
				visibleItems={visibleItems}
			/>
		),
		comAcademy: <FeedCardCardComAcademy data={data} elementId={elementId} />,
		cultureCom: <FeedCardCultureCom data={data} elementId={elementId} />,
		actusBref: <FeedCardActusBref data={data} elementId={elementId} />,
		"feed-post-petitesHistoires": (
			<FeedCardVideo
				data={data}
				elementId={elementId}
				visibleItems={visibleItems}
			/>
		),
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
