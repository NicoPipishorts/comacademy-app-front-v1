// A single card entry
export interface CitationCard {
	title: string;
	url: string;
	category: string;
}

// The “data” payload
export interface CitationsMenuData {
	subTitle: string;
	cards: CitationCard[];
}

// The full API response
export interface CitationsMenuResponse {
	data: CitationsMenuData;
}
