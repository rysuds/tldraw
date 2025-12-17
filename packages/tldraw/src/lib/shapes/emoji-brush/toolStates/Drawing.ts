import { StateNode, TLPointerEventInfo, Vec, createShapeId, toFixed } from '@tldraw/editor'
import { TLEmojiBrushEmoji, TLEmojiBrushShape } from '../emoji-brush-types'
import { getRandomChristmasEmoji } from '../EmojiBrushShapeUtil'

// Minimum distance between emoji placements (in pixels)
const MIN_EMOJI_SPACING = 20

export class Drawing extends StateNode {
	static override id = 'drawing'

	info = {} as TLPointerEventInfo

	initialShape?: TLEmojiBrushShape

	lastPlacedPoint = {} as Vec

	markId = null as null | string

	override onEnter(info: TLPointerEventInfo) {
		this.markId = null
		this.info = info
		this.lastPlacedPoint = this.editor.inputs.currentPagePoint.clone()
		this.startShape()
	}

	override onPointerMove() {
		const { inputs } = this.editor

		// Check if we've moved far enough to place a new emoji
		const dist = Vec.Dist(inputs.currentPagePoint, this.lastPlacedPoint)
		if (dist >= MIN_EMOJI_SPACING) {
			this.addEmoji()
			this.lastPlacedPoint = inputs.currentPagePoint.clone()
		}
	}

	private startShape() {
		const {
			inputs: { originPagePoint },
		} = this.editor

		this.markId = this.editor.markHistoryStoppingPoint('emoji-brush start')

		const id = createShapeId()

		const initialEmoji: TLEmojiBrushEmoji = {
			x: 0,
			y: 0,
			emoji: getRandomChristmasEmoji(),
		}

		this.editor.createShape<TLEmojiBrushShape>({
			id,
			type: 'emoji-brush',
			x: originPagePoint.x,
			y: originPagePoint.y,
			props: {
				scale: this.editor.user.getIsDynamicResizeMode() ? 1 / this.editor.getZoomLevel() : 1,
				emojis: [initialEmoji],
				isComplete: false,
			},
		})

		const shape = this.editor.getShape<TLEmojiBrushShape>(id)
		if (!shape) {
			this.cancel()
			return
		}

		this.initialShape = shape
		this.lastPlacedPoint = originPagePoint.clone()
	}

	private addEmoji() {
		const { initialShape } = this
		if (!initialShape) return

		const shape = this.editor.getShape<TLEmojiBrushShape>(initialShape.id)
		if (!shape) return

		const { inputs } = this.editor

		// Convert current point to shape space
		const pointInShapeSpace = this.editor.getPointInShapeSpace(shape, inputs.currentPagePoint)

		const newEmoji: TLEmojiBrushEmoji = {
			x: toFixed(pointInShapeSpace.x),
			y: toFixed(pointInShapeSpace.y),
			emoji: getRandomChristmasEmoji(),
		}

		const newEmojis = [...shape.props.emojis, newEmoji]

		this.editor.updateShapes([
			{
				id: shape.id,
				type: 'emoji-brush',
				props: {
					emojis: newEmojis,
				},
			},
		])
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
