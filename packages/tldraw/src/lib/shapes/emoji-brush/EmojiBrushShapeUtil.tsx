import {
	Box,
	Polyline2d,
	SVGContainer,
	ShapeUtil,
	SvgExportContext,
	TLEmojiBrushShape,
	TLEmojiBrushShapeProps,
	TLResizeInfo,
	Vec,
	emojiBrushShapeMigrations,
	emojiBrushShapeProps,
	toFixed,
	useEditor,
} from '@tldraw/editor'

/** @public */
export interface EmojiBrushShapeOptions {
	/**
	 * The maximum number of emojis before the brush tool will begin a new shape.
	 */
	readonly maxEmojisPerShape: number
}

/** @public */
export class EmojiBrushShapeUtil extends ShapeUtil<TLEmojiBrushShape> {
	static override type = 'emoji-brush' as const
	static override props = emojiBrushShapeProps
	static override migrations = emojiBrushShapeMigrations

	override options: EmojiBrushShapeOptions = {
		maxEmojisPerShape: 500,
	}

	override hideResizeHandles() {
		return true
	}
	override hideRotateHandle() {
		return true
	}
	override hideSelectionBoundsFg() {
		return true
	}

	override getDefaultProps(): TLEmojiBrushShape['props'] {
		return {
			emojis: [],
			isComplete: false,
			scale: 1,
		}
	}

	getGeometry(shape: TLEmojiBrushShape) {
		// Create a simple polyline through all emoji positions
		const points = shape.props.emojis.map((e) => new Vec(e.position.x, e.position.y))
		
		if (points.length === 0) {
			return new Polyline2d({ points: [new Vec(0, 0)] })
		}

		return new Polyline2d({
			points,
		})
	}

	component(shape: TLEmojiBrushShape) {
		return (
			<SVGContainer>
				<EmojiBrushSvg shape={shape} />
			</SVGContainer>
		)
	}

	indicator(shape: TLEmojiBrushShape) {
		// No indicator needed for emoji brush
		return null
	}

	override toSvg(shape: TLEmojiBrushShape, ctx: SvgExportContext) {
		const scaleFactor = 1 / shape.props.scale
		return (
			<g transform={`scale(${scaleFactor})`}>
				<EmojiBrushSvg shape={shape} />
			</g>
		)
	}

	override onResize(shape: TLEmojiBrushShape, info: TLResizeInfo<TLEmojiBrushShape>) {
		const { scaleX, scaleY } = info

		const newEmojis = shape.props.emojis.map((emojiPlacement) => ({
			...emojiPlacement,
			position: {
				x: toFixed(scaleX * emojiPlacement.position.x),
				y: toFixed(scaleY * emojiPlacement.position.y),
				z: emojiPlacement.position.z,
			},
		}))

		return {
			props: {
				emojis: newEmojis,
			},
		}
	}
}

function EmojiBrushSvg({ shape }: { shape: TLEmojiBrushShape }) {
	const editor = useEditor()
	
	// Base emoji size - scaled by shape scale
	const baseSize = 32 * shape.props.scale
	const fontSize = baseSize

	return (
		<>
			{shape.props.emojis.map((emojiPlacement, index) => (
				<text
					key={index}
					x={emojiPlacement.position.x}
					y={emojiPlacement.position.y}
					fontSize={fontSize}
					textAnchor="middle"
					dominantBaseline="middle"
					style={{
						userSelect: 'none',
						pointerEvents: 'none',
					}}
				>
					{emojiPlacement.emoji}
				</text>
			))}
		</>
	)
}
