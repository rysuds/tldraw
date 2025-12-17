import {
	Geometry2d,
	Rectangle2d,
	ShapeUtil,
	T,
	TLBaseShape,
	TLResizeInfo,
	resizeBox,
} from '@tldraw/editor'

// Christmas-themed emojis
const CHRISTMAS_EMOJIS = [
	'🎄', // Christmas tree
	'🎅', // Santa
	'🤶', // Mrs. Claus
	'🎁', // Gift
	'⭐', // Star
	'❄️', // Snowflake
	'☃️', // Snowman
	'🦌', // Reindeer
	'🔔', // Bell
	'🕯️', // Candle
	'🍪', // Cookie
	'🥛', // Milk
	'🧦', // Stocking
	'🎀', // Ribbon
	'✨', // Sparkles
]

/** @public */
export interface EmojiBrushPoint {
	x: number
	y: number
	emoji: string
}

/** @public */
export const emojiBrushPointValidator: T.ObjectValidator<EmojiBrushPoint> = T.object({
	x: T.number,
	y: T.number,
	emoji: T.string,
})

/** @public */
export interface TLEmojiBrushShapeProps {
	w: number
	h: number
	points: EmojiBrushPoint[]
	isComplete: boolean
	scale: number
}

/** @public */
export type TLEmojiBrushShape = TLBaseShape<'emoji-brush', TLEmojiBrushShapeProps>

/** @public */
export const emojiBrushShapeProps = {
	w: T.nonZeroNumber,
	h: T.nonZeroNumber,
	points: T.arrayOf(emojiBrushPointValidator),
	isComplete: T.boolean,
	scale: T.nonZeroNumber,
}

/** @public */
export function getRandomChristmasEmoji(): string {
	return CHRISTMAS_EMOJIS[Math.floor(Math.random() * CHRISTMAS_EMOJIS.length)]
}

/** @public */
export class EmojiBrushShapeUtil extends ShapeUtil<TLEmojiBrushShape> {
	static override type = 'emoji-brush' as const
	static override props = emojiBrushShapeProps

	override canEdit() {
		return false
	}

	override hideRotateHandle() {
		return false
	}

	override hideSelectionBoundsFg() {
		return false
	}

	getDefaultProps(): TLEmojiBrushShape['props'] {
		return {
			w: 1,
			h: 1,
			points: [],
			isComplete: false,
			scale: 1,
		}
	}

	getGeometry(shape: TLEmojiBrushShape): Geometry2d {
		const { w, h, scale } = shape.props
		return new Rectangle2d({
			width: Math.max(1, w) * scale,
			height: Math.max(1, h) * scale,
			isFilled: false,
		})
	}

	component(shape: TLEmojiBrushShape) {
		const { points, scale } = shape.props
		const fontSize = 24 * scale

		return (
			<div
				style={{
					width: '100%',
					height: '100%',
					position: 'relative',
					pointerEvents: 'none',
				}}
			>
				{points.map((point, i) => (
					<span
						key={i}
						style={{
							position: 'absolute',
							left: point.x * scale,
							top: point.y * scale,
							fontSize: `${fontSize}px`,
							lineHeight: 1,
							transform: 'translate(-50%, -50%)',
							userSelect: 'none',
							pointerEvents: 'none',
						}}
					>
						{point.emoji}
					</span>
				))}
			</div>
		)
	}

	indicator(shape: TLEmojiBrushShape) {
		const { w, h, scale } = shape.props
		return <rect width={w * scale} height={h * scale} fill="none" />
	}

	override toSvg(shape: TLEmojiBrushShape) {
		const { points, scale } = shape.props
		const fontSize = 24 * scale

		return (
			<g>
				{points.map((point, i) => (
					<text
						key={i}
						x={point.x * scale}
						y={point.y * scale}
						fontSize={fontSize}
						textAnchor="middle"
						dominantBaseline="central"
					>
						{point.emoji}
					</text>
				))}
			</g>
		)
	}

	override onResize(shape: TLEmojiBrushShape, info: TLResizeInfo<TLEmojiBrushShape>) {
		return resizeBox(shape, info)
	}
}
