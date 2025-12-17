import { StateNode, TLStateNodeConstructor } from '@tldraw/editor'
import { Drawing } from './toolStates/Drawing'
import { Idle } from './toolStates/Idle'

/** @public */
export class EmojiBrushShapeTool extends StateNode {
	static override id = 'emoji-brush'
	static override initial = 'idle'
	static override isLockable = false
	static override useCoalescedEvents = true
	static override children(): TLStateNodeConstructor[] {
		return [Idle, Drawing]
	}

	override shapeType = 'emoji-brush'

	override onExit() {
		const drawingState = this.children!['drawing'] as Drawing
		drawingState.initialShape = undefined
	}
}
