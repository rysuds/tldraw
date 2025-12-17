import {
	Box,
	Circle2d,
	Polygon2d,
	SVGContainer,
	ShapeUtil,
	TLEmojiBrushShape,
	TLEmojiBrushShapeProps,
	TLResizeInfo,
	Vec,
	emojiBrushShapeMigrations,
	emojiBrushShapeProps,
	lerp,
} from '@tldraw/editor'

/** @public */
export const CHRISTMAS_EMOJIS = [
	'🎄',
	'🎅',
	'🤶',
	'🦌',
	'⛄',
	'❄️',
	'🎁',
	'🔔',
	'⭐',
	'🕯️',
	'🎉',
	'✨',
	'🧦',
	'🍪',
	'🥛',
	'🌟',
	'🎀',
	'🧣',
	'🧤',
	'🍬',
] as const

/** @public */
export interface EmojiBrushShapeOptions {
	/**
	 * The spacing between emojis in pixels.
	 */
	readonly emojiSpacing: number
	/**
	 * The base size of emojis.
	 */
	readonly emojiSize: number
}

/** @public */
export class EmojiBrushShapeUtil extends ShapeUtil<TLEmojiBrushShape> {
	static override type = 'emoji-brush' as const
	static override props = emojiBrushShapeProps
	static override migrations = emojiBrushShapeMigrations

	override options: EmojiBrushShapeOptions = {
		emojiSpacing: 24,
		emojiSize: 24,
	}

	override hideResizeHandles(shape: TLEmojiBrushShape) {
		return getIsDot(shape)
	}

	override hideRotateHandle(shape: TLEmojiBrushShape) {
		return getIsDot(shape)
	}

	override hideSelectionBoundsFg(shape: TLEmojiBrushShape) {
		return getIsDot(shape)
	}

	override getDefaultProps(): TLEmojiBrushShape['props'] {
		return {
			points: [],
			isComplete: false,
			scale: 1,
		}
	}

	getGeometry(shape: TLEmojiBrushShape) {
		const { points, scale } = shape.props
		const size = this.options.emojiSize * scale

		if (points.length === 0) {
			return new Circle2d({
				x: 0,
				y: 0,
				radius: size / 2,
				isFilled: true,
			})
		}

		if (points.length === 1) {
			return new Circle2d({
				x: points[0].x - size / 2,
				y: points[0].y - size / 2,
				radius: size / 2,
				isFilled: true,
			})
		}

		// Get the bounding box of all points and expand by emoji size
		const bounds = Box.FromPoints(points.map((p) => new Vec(p.x, p.y)))
		const padding = size / 2

		// Create a simple rectangle polygon around the bounds
		return new Polygon2d({
			points: [
				new Vec(bounds.minX - padding, bounds.minY - padding),
				new Vec(bounds.maxX + padding, bounds.minY - padding),
				new Vec(bounds.maxX + padding, bounds.maxY + padding),
				new Vec(bounds.minX - padding, bounds.maxY + padding),
			],
			isFilled: true,
		})
	}

	component(shape: TLEmojiBrushShape) {
		const { points, scale } = shape.props
		const fontSize = this.options.emojiSize * scale

		return (
			<SVGContainer>
				{points.map((point, i) => (
					<text
						key={i}
						x={point.x}
						y={point.y}
						fontSize={fontSize}
						textAnchor="middle"
						dominantBaseline="central"
						style={{ userSelect: 'none', pointerEvents: 'none' }}
					>
						{point.emoji}
					</text>
				))}
			</SVGContainer>
		)
	}

	indicator(shape: TLEmojiBrushShape) {
		const { points, scale } = shape.props
		const size = this.options.emojiSize * scale

		if (points.length === 0) {
			return <circle cx={0} cy={0} r={size / 2} />
		}

		// Get bounds
		const bounds = Box.FromPoints(points.map((p) => new Vec(p.x, p.y)))
		const padding = size / 2

		return (
			<rect
				x={bounds.minX - padding}
				y={bounds.minY - padding}
				width={bounds.width + size}
				height={bounds.height + size}
				rx={size / 4}
				ry={size / 4}
			/>
		)
	}

	override toSvg(shape: TLEmojiBrushShape) {
		const { points, scale } = shape.props
		const fontSize = this.options.emojiSize * scale

		return (
			<g>
				{points.map((point, i) => (
					<text
						key={i}
						x={point.x}
						y={point.y}
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
		const { scaleX, scaleY } = info

		return {
			props: {
				points: shape.props.points.map((point) => ({
					...point,
					x: point.x * scaleX,
					y: point.y * scaleY,
				})),
			},
		}
	}

	override getInterpolatedProps(
		startShape: TLEmojiBrushShape,
		endShape: TLEmojiBrushShape,
		t: number
	): TLEmojiBrushShapeProps {
		return {
			...(t > 0.5 ? endShape.props : startShape.props),
			scale: lerp(startShape.props.scale, endShape.props.scale, t),
		}
	}
}

function getIsDot(shape: TLEmojiBrushShape) {
	return shape.props.points.length < 2
}
