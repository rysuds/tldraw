import {
	StateNode,
	TLEmojiBrushPoint,
	TLEmojiBrushShape,
	TLPointerEventInfo,
	TLShapePartial,
	Vec,
	createShapeId,
} from '@tldraw/editor'
import {
	CHRISTMAS_EMOJIS,
	EmojiBrushShapeUtil,
} from '../EmojiBrushShapeUtil'

export class Drawing extends StateNode {
	static override id = 'drawing'

	info = {} as TLPointerEventInfo

	initialShape?: TLEmojiBrushShape

	markId = null as null | string

	lastRecordedPoint = {} as Vec

	override onEnter(info: TLPointerEventInfo) {
		this.markId = null
		this.info = info
		this.lastRecordedPoint = this.editor.inputs.currentPagePoint.clone()
		this.startShape()
	}

	override onPointerMove() {
		this.updateDrawingShape()
	}

	override onExit() {
		// Clean up
	}

	private getRandomEmoji(): string {
		const index = Math.floor(Math.random() * CHRISTMAS_EMOJIS.length)
		return CHRISTMAS_EMOJIS[index]
	}

	private getEmojiSpacing(): number {
		const util = this.editor.getShapeUtil('emoji-brush') as EmojiBrushShapeUtil
		return util.options.emojiSpacing
	}

	private startShape() {
		const {
			inputs: { originPagePoint },
		} = this.editor

		this.markId = this.editor.markHistoryStoppingPoint('emoji-brush start')

		this.lastRecordedPoint = originPagePoint.clone()

		const id = createShapeId()
		const initialEmoji = this.getRandomEmoji()

		this.editor.createShape<TLEmojiBrushShape>({
			id,
			type: 'emoji-brush',
			x: originPagePoint.x,
			y: originPagePoint.y,
			props: {
				scale: this.editor.user.getIsDynamicResizeMode() ? 1 / this.editor.getZoomLevel() : 1,
				points: [
					{
						x: 0,
						y: 0,
						emoji: initialEmoji,
					},
				],
			},
		})

		const shape = this.editor.getShape<TLEmojiBrushShape>(id)
		if (!shape) {
			this.cancel()
			return
		}

		this.initialShape = shape
	}

	private updateDrawingShape() {
		const { initialShape } = this
		const { inputs } = this.editor

		if (!initialShape) return

		const shape = this.editor.getShape<TLEmojiBrushShape>(initialShape.id)
		if (!shape) return

		const { points, scale } = shape.props
		const currentPagePoint = inputs.currentPagePoint

		// Get point in shape space
		const pointInShapeSpace = this.editor.getPointInShapeSpace(shape, currentPagePoint)

		// Check distance from last point
		const lastPoint = points[points.length - 1]
		const lastPointVec = new Vec(lastPoint.x, lastPoint.y)
		const spacing = this.getEmojiSpacing() * scale

		const distance = Vec.Dist(pointInShapeSpace, lastPointVec)

		if (distance >= spacing) {
			// Add intermediate points to maintain even spacing
			const numPoints = Math.floor(distance / spacing)
			const newPoints: TLEmojiBrushPoint[] = [...points]

			for (let i = 1; i <= numPoints; i++) {
				const t = i / numPoints
				const interpolatedPoint = Vec.Lrp(lastPointVec, pointInShapeSpace, t)

				newPoints.push({
					x: interpolatedPoint.x,
					y: interpolatedPoint.y,
					emoji: this.getRandomEmoji(),
				})
			}

			this.lastRecordedPoint = currentPagePoint.clone()

			const shapePartial: TLShapePartial<TLEmojiBrushShape> = {
				id: shape.id,
				type: 'emoji-brush',
				props: {
					points: newPoints,
				},
			}

			this.editor.updateShapes([shapePartial])
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

	complete() {
		const { initialShape } = this
		if (!initialShape) return
		this.editor.updateShapes([
			{ id: initialShape.id, type: initialShape.type, props: { isComplete: true } },
		])

		this.parent.transition('idle')
	}

	cancel() {
		this.parent.transition('idle', this.info)
	}
}
