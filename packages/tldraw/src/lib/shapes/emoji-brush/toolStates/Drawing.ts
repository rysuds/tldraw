import {
	StateNode,
	TLEmojiBrushShape,
	TLPointerEventInfo,
	TLShapePartial,
	Vec,
	createShapeId,
	structuredClone,
	toFixed,
} from '@tldraw/editor'
import { EmojiBrushShapeUtil } from '../EmojiBrushShapeUtil'

// Christmas emoji set
const CHRISTMAS_EMOJIS = [
	'🎅', // Santa
	'🎄', // Christmas tree
	'🎁', // Gift
	'⛄', // Snowman
	'❄️', // Snowflake
	'🔔', // Bell
	'⭐', // Star
	'🕯️', // Candle
	'🦌', // Reindeer
	'🤶', // Mrs. Claus
	'🎀', // Ribbon
	'🧦', // Stocking
	'🍪', // Cookie
	'🥛', // Milk
	'✨', // Sparkles
]

export class Drawing extends StateNode {
	static override id = 'drawing'

	info = {} as TLPointerEventInfo

	initialShape?: TLEmojiBrushShape

	override shapeType = 'emoji-brush' as const

	util = this.editor.getShapeUtil(this.shapeType) as EmojiBrushShapeUtil

	lastRecordedPoint = {} as Vec
	mergeNextPoint = false

	markId = null as null | string

	// Spacing between emojis (in pixels)
	emojiSpacing = 25

	override onEnter(info: TLPointerEventInfo) {
		this.markId = null
		this.info = info
		this.lastRecordedPoint = this.editor.inputs.currentPagePoint.clone()
		this.startShape()
	}

	override onPointerMove() {
		const { inputs } = this.editor

		// Check if we've moved far enough to place a new emoji
		const distance = Vec.Dist(inputs.currentPagePoint, this.lastRecordedPoint)
		
		if (distance >= this.emojiSpacing / this.editor.getZoomLevel()) {
			this.lastRecordedPoint = inputs.currentPagePoint.clone()
			this.mergeNextPoint = false
			this.updateDrawingShape()
		}
	}

	override onExit() {
		this.lastRecordedPoint = this.editor.inputs.currentPagePoint.clone()
	}

	private getRandomChristmasEmoji(): string {
		return CHRISTMAS_EMOJIS[Math.floor(Math.random() * CHRISTMAS_EMOJIS.length)]
	}

	private startShape() {
		const {
			inputs: { originPagePoint },
		} = this.editor

		this.markId = this.editor.markHistoryStoppingPoint('emoji brush start')

		this.lastRecordedPoint = originPagePoint.clone()

		// Create a new shape
		const id = createShapeId()

		this.editor.createShape<TLEmojiBrushShape>({
			id,
			type: this.shapeType,
			x: originPagePoint.x,
			y: originPagePoint.y,
			props: {
				scale: this.editor.user.getIsDynamicResizeMode() ? 1 / this.editor.getZoomLevel() : 1,
				emojis: [
					{
						position: { x: 0, y: 0, z: 0.5 },
						emoji: this.getRandomChristmasEmoji(),
					},
				],
			},
		})

		const shape = this.editor.getShape<TLEmojiBrushShape>(id)
		if (!shape) {
			this.cancel()
			return
		}
		
		this.initialShape = this.editor.getShape<TLEmojiBrushShape>(id)
	}

	private updateDrawingShape() {
		const { initialShape } = this
		const { inputs } = this.editor

		if (!initialShape) return

		const { id } = initialShape

		const shape = this.editor.getShape<TLEmojiBrushShape>(id)!

		if (!shape) return

		const { emojis } = shape.props

		const pointInShapeSpace = this.editor.getPointInShapeSpace(shape, inputs.currentPagePoint).toFixed()
		
		const newEmoji = {
			position: { x: pointInShapeSpace.x, y: pointInShapeSpace.y, z: 0.5 },
			emoji: this.getRandomChristmasEmoji(),
		}

		const newEmojis = [...emojis, newEmoji]

		const shapePartial: TLShapePartial<TLEmojiBrushShape> = {
			id,
			type: this.shapeType,
			props: {
				emojis: newEmojis,
			},
		}

		this.editor.updateShapes<TLEmojiBrushShape>([shapePartial])

		// If we've reached the max emojis, complete this shape and start a new one
		if (newEmojis.length >= this.util.options.maxEmojisPerShape) {
			this.editor.updateShapes([{ id, type: this.shapeType, props: { isComplete: true } }])

			const newShapeId = createShapeId()

			if (!this.editor.canCreateShapes([newShapeId])) return this.cancel()
			
			this.editor.createShape<TLEmojiBrushShape>({
				id: newShapeId,
				type: this.shapeType,
				x: toFixed(inputs.currentPagePoint.x),
				y: toFixed(inputs.currentPagePoint.y),
				props: {
					scale: shape.props.scale,
					emojis: [
						{
							position: { x: 0, y: 0, z: 0.5 },
							emoji: this.getRandomChristmasEmoji(),
						},
					],
				},
			})

			const newShape = this.editor.getShape<TLEmojiBrushShape>(newShapeId)

			if (!newShape) {
				return this.cancel()
			}

			this.initialShape = structuredClone(newShape)
			this.lastRecordedPoint = inputs.currentPagePoint.clone()
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
