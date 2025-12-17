import {
	HTMLContainer,
	Polyline2d,
	ShapeUtil,
	SvgExportContext,
	TLResizeInfo,
	Vec,
	toFixed,
} from '@tldraw/editor'
import { TLEmojiBrushShape, TLEmojiBrushShapeProps } from './emoji-brush-types'

// Christmas-related emojis
const CHRISTMAS_EMOJIS = [
	'🎄',
	'🎅',
	'🤶',
	'🎁',
	'⛄',
	'❄️',
	'🦌',
	'🔔',
	'🕯️',
	'🌟',
	'✨',
	'🎀',
	'🧦',
	'🍪',
	'🥛',
	'🎶',
	'🌲',
	'❤️',
	'💚',
]

/** @public */
export class EmojiBrushShapeUtil extends ShapeUtil<TLEmojiBrushShape> {
	static override type = 'emoji-brush' as const

	override getDefaultProps(): TLEmojiBrushShape['props'] {
		return {
			emojis: [],
			isComplete: false,
			scale: 1,
		}
	}

	getGeometry(shape: TLEmojiBrushShape) {
		const points = shape.props.emojis.map((e) => new Vec(e.x, e.y))

		if (points.length === 0) {
			return new Polyline2d({ points: [new Vec(0, 0), new Vec(1, 1)] })
		}

		if (points.length === 1) {
			return new Polyline2d({ points: [points[0], points[0].clone()] })
		}

		return new Polyline2d({ points })
	}

	component(shape: TLEmojiBrushShape) {
		const { emojis, scale } = shape.props
		const fontSize = 24 * scale

		return (
			<HTMLContainer>
				<div
					style={{
						position: 'relative',
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
					}}
				>
					{emojis.map((emoji, i) => (
						<span
							key={i}
							style={{
								position: 'absolute',
								left: emoji.x - fontSize / 2,
								top: emoji.y - fontSize / 2,
								fontSize: `${fontSize}px`,
								lineHeight: 1,
								userSelect: 'none',
							}}
						>
							{emoji.emoji}
						</span>
					))}
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: TLEmojiBrushShape) {
		const { emojis } = shape.props
		if (emojis.length === 0) return null

		const bounds = this.editor.getShapeGeometry(shape).getBounds()

		return (
			<rect
				x={bounds.x}
				y={bounds.y}
				width={bounds.width}
				height={bounds.height}
				fill="none"
				stroke="currentColor"
				strokeWidth={1}
			/>
		)
	}

	override toSvg(shape: TLEmojiBrushShape, _ctx: SvgExportContext) {
		const { emojis, scale } = shape.props
		const fontSize = 24 * scale

		return (
			<g>
				{emojis.map((emoji, i) => (
					<text
						key={i}
						x={emoji.x}
						y={emoji.y}
						fontSize={fontSize}
						textAnchor="middle"
						dominantBaseline="middle"
					>
						{emoji.emoji}
					</text>
				))}
			</g>
		)
	}

	override onResize(shape: TLEmojiBrushShape, info: TLResizeInfo<TLEmojiBrushShape>) {
		const { scaleX, scaleY } = info

		const newEmojis = shape.props.emojis.map((emoji) => ({
			...emoji,
			x: toFixed(scaleX * emoji.x),
			y: toFixed(scaleY * emoji.y),
		}))

		return {
			props: {
				emojis: newEmojis,
			},
		}
	}

	override expandSelectionOutlinePx(shape: TLEmojiBrushShape): number {
		return 12 * shape.props.scale
	}

	override getInterpolatedProps(
		startShape: TLEmojiBrushShape,
		endShape: TLEmojiBrushShape,
		t: number
	): TLEmojiBrushShapeProps {
		return t > 0.5 ? endShape.props : startShape.props
	}
}

/** Get a random Christmas emoji */
export function getRandomChristmasEmoji(): string {
	return CHRISTMAS_EMOJIS[Math.floor(Math.random() * CHRISTMAS_EMOJIS.length)]
}

/** Get the list of Christmas emojis */
export function getChristmasEmojis(): readonly string[] {
	return CHRISTMAS_EMOJIS
}
