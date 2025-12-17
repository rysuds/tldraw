import { TLEmojiBrushShape } from '@tldraw/editor'
import { TestEditor } from '../../../test/TestEditor'
import { EmojiBrushShapeTool } from './EmojiBrushShapeTool'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
})
afterEach(() => {
	editor?.dispose()
})

describe('EmojiBrushShapeTool', () => {
	it('creates an emoji brush shape on pointer down', () => {
		editor.setCurrentTool('emoji-brush')
		editor.pointerDown(0, 0)
		expect(editor.getCurrentPageShapes().length).toBe(1)
		expect(editor.getCurrentPageShapes()[0].type).toBe('emoji-brush')
	})

	it('adds emojis as the pointer moves', () => {
		editor.setCurrentTool('emoji-brush')
		editor.pointerDown(0, 0)
		
		const shape = editor.getCurrentPageShapes()[0] as TLEmojiBrushShape
		const initialEmojiCount = shape.props.emojis.length
		
		// Move pointer to trigger emoji placement
		editor.pointerMove(50, 50)
		
		const updatedShape = editor.getCurrentPageShapes()[0] as TLEmojiBrushShape
		expect(updatedShape.props.emojis.length).toBeGreaterThan(initialEmojiCount)
	})

	it('completes the shape on pointer up', () => {
		editor.setCurrentTool('emoji-brush')
		editor.pointerDown(0, 0)
		editor.pointerMove(50, 50)
		editor.pointerUp()
		
		const shape = editor.getCurrentPageShapes()[0] as TLEmojiBrushShape
		expect(shape.props.isComplete).toBe(true)
	})

	it('only uses Christmas emojis', () => {
		const christmasEmojis = ['🎅', '🎄', '🎁', '⛄', '❄️', '🔔', '⭐', '🕯️', '🦌', '🤶', '🎀', '🧦', '🍪', '🥛', '✨']
		
		editor.setCurrentTool('emoji-brush')
		editor.pointerDown(0, 0)
		editor.pointerMove(100, 100)
		editor.pointerMove(200, 200)
		
		const shape = editor.getCurrentPageShapes()[0] as TLEmojiBrushShape
		const allEmojisAreChristmas = shape.props.emojis.every((emojiPlacement) => 
			christmasEmojis.includes(emojiPlacement.emoji)
		)
		
		expect(allEmojisAreChristmas).toBe(true)
	})

	it('transitions to idle on cancel', () => {
		editor.setCurrentTool('emoji-brush')
		editor.cancel()
		expect(editor.getCurrentToolId()).toBe('select')
	})
})
