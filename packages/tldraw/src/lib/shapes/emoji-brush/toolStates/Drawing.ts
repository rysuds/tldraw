import {
	StateNode,
	TLPointerEventInfo,
	TLShapePartial,
	Vec,
	createShapeId,
	toFixed,
} from '@tldraw/editor'
import { EmojiBrushPoint, TLEmojiBrushShape, getRandomChristmasEmoji } from '../EmojiBrushShapeUtil'

// Minimum distance between emoji placements (in pixels)
const MIN_EMOJI_SPACING = 20

export class Drawing extends StateNode {
	static override id = 'drawing'

	info = {} as TLPointerEventInfo
	shapeId = createShapeId()
	initialPagePoint = new Vec()
	lastPlacedPoint = new Vec()
	markId = null as null | string
	points: EmojiBrushPoint[] = []
	minX = 0
	minY = 0
	maxX = 0
	maxY = 0

	override onEnter(info: TLPointerEventInfo) {
		this.info = info
		this.markId = this.editor.markHistoryStoppingPoint('emoji-brush start')
		this.shapeId = createShapeId()
		this.initialPagePoint = this.editor.inputs.originPagePoint.clone()
		this.lastPlacedPoint = this.initialPagePoint.clone()
		this.points = []
		this.minX = 0
		this.minY = 0
		this.maxX = 0
		this.maxY = 0

		// Place the first emoji at the starting point
		this.addEmojiAtPoint(this.initialPagePoint)
		this.createShape()
	}

	override onPointerMove() {
		const { currentPagePoint } = this.editor.inputs
		const distance = Vec.Dist(this.lastPlacedPoint, currentPagePoint)

		// Place emojis along the path if we've moved far enough
		if (distance >= MIN_EMOJI_SPACING) {
			// Calculate how many emojis to place
			const numEmojis = Math.floor(distance / MIN_EMOJI_SPACING)
			const direction = Vec.Sub(currentPagePoint, this.lastPlacedPoint).uni()

			for (let i = 1; i <= numEmojis; i++) {
				const point = Vec.Add(this.lastPlacedPoint, Vec.Mul(direction, MIN_EMOJI_SPACING * i))
				this.addEmojiAtPoint(point)
			}

			// Update last placed point
			this.lastPlacedPoint = Vec.Add(
				this.lastPlacedPoint,
				Vec.Mul(direction, MIN_EMOJI_SPACING * numEmojis)
			)

			this.updateShape()
		}
	}

	override onPointerUp() {
		this.complete()
	}

	override onCancel() {
		this.cancel()
	}

	override onComplete() {
		this.complete()
	}

	override onInterrupt() {
		if (this.editor.inputs.isDragging) {
			return
		}

		if (this.markId) {
			this.editor.bailToMark(this.markId)
		}
		this.cancel()
	}

	private addEmojiAtPoint(pagePoint: Vec) {
		// Convert page point to shape-local coordinates
		const localX = toFixed(pagePoint.x - this.initialPagePoint.x)
		const localY = toFixed(pagePoint.y - this.initialPagePoint.y)

		// Update bounds
		this.minX = Math.min(this.minX, localX)
		this.minY = Math.min(this.minY, localY)
		this.maxX = Math.max(this.maxX, localX)
		this.maxY = Math.max(this.maxY, localY)

		this.points.push({
			x: localX,
			y: localY,
			emoji: getRandomChristmasEmoji(),
		})
	}

	private createShape() {
		const padding = 15 // Padding for emoji size

		this.editor.createShape<TLEmojiBrushShape>({
			id: this.shapeId,
			type: 'emoji-brush',
			x: this.initialPagePoint.x - padding,
			y: this.initialPagePoint.y - padding,
			props: {
				w: 1,
				h: 1,
				points: this.points.map((p) => ({
					...p,
					x: p.x + padding,
					y: p.y + padding,
				})),
				isComplete: false,
				scale: this.editor.user.getIsDynamicResizeMode() ? 1 / this.editor.getZoomLevel() : 1,
			},
		})
	}

	private updateShape() {
		const padding = 15 // Padding for emoji size

		const w = Math.max(1, this.maxX - this.minX + padding * 2)
		const h = Math.max(1, this.maxY - this.minY + padding * 2)

		// Adjust points to be relative to the new shape bounds
		const adjustedPoints = this.points.map((p) => ({
			...p,
			x: p.x - this.minX + padding,
			y: p.y - this.minY + padding,
		}))

		const shapePartial: TLShapePartial<TLEmojiBrushShape> = {
			id: this.shapeId,
			type: 'emoji-brush',
			x: this.initialPagePoint.x + this.minX - padding,
			y: this.initialPagePoint.y + this.minY - padding,
			props: {
				w,
				h,
				points: adjustedPoints,
			},
		}

		this.editor.updateShapes([shapePartial])
	}

	private complete() {
		this.editor.updateShapes<TLEmojiBrushShape>([
			{
				id: this.shapeId,
				type: 'emoji-brush',
				props: { isComplete: true },
			},
		])

		this.parent.transition('idle')
	}

	private cancel() {
		if (this.markId) {
			this.editor.bailToMark(this.markId)
		}
		this.parent.transition('idle', this.info)
	}
}
