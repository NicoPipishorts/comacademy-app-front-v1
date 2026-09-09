import React from "react";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

/**
 * "Iconly/Curved/Arrow---Right" lifted verbatim from the onboarding artwork
 * (assets/imgs/onboarding/v2), so the bullets in the about sheets match the
 * design. Pass the two stops the slide uses - repeat one colour for a flat fill.
 */
const ARROW_PATH =
	"M15109.346,16594.357a6.736,6.736,0,0,1-3.952-1.742,20.173,20.173,0,0,1-3.136-3.348,38.735,38.735,0,0,1-3.077-4.715,1.5,1.5,0,1,1,2.64-1.42,37.748,37.748,0,0,0,2.836,4.334,14.086,14.086,0,0,0,3.328,3.334v-20.3a1.5,1.5,0,0,1,3,0v20.307a14.09,14.09,0,0,0,3.349-3.365,36.893,36.893,0,0,0,2.815-4.3,1.5,1.5,0,1,1,2.641,1.42,39.509,39.509,0,0,1-3.078,4.715,20.173,20.173,0,0,1-3.136,3.348,6.726,6.726,0,0,1-3.952,1.742c-.046,0-.091.006-.138.006S15109.392,16594.361,15109.346,16594.357Z";

export default function SectionAboutArrow({
	size = 24,
	colors,
	gradientId,
}: {
	size?: number;
	colors: readonly [string, string];
	/** Must be unique per sheet: SVG defs share one id namespace. */
	gradientId: string;
}) {
	return (
		<Svg width={size} height={size} viewBox='-2 -2 28 28'>
			<Defs>
				{/* Vertical in path space; the -90deg rotation below turns it into
				    the design's left-to-right ramp. */}
				<LinearGradient id={gradientId} x1='0.5' y1='0' x2='0.5' y2='1'>
					<Stop offset='0' stopColor={colors[0]} />
					<Stop offset='1' stopColor={colors[1]} />
				</LinearGradient>
			</Defs>
			<G transform='translate(4.75 23.666) rotate(-90)'>
				<Path
					d={ARROW_PATH}
					transform='translate(-15100.5 -16570.498)'
					fill={`url(#${gradientId})`}
				/>
			</G>
		</Svg>
	);
}
