export interface NavigationType {
	goBack(): void;
	navigate: (screenName: string, params?: Record<string, any>) => void; // Updated to include optional params
	popToTop: (screenName: string) => void; // Updated to match React Navigation's popToTop signature (no parameters)
	replace: (screenName: string) => void;
	getParent(): any;
}
