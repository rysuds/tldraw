import {
	DefaultKeyboardShortcutsDialog,
	DefaultKeyboardShortcutsDialogContent,
	DefaultToolbar,
	DefaultToolbarContent,
	StateNode,
	TLComponents,
	TLPointerEventInfo,
	TLTextShape,
	TLUiAssetUrlOverrides,
	TLUiOverrides,
	Tldraw,
	TldrawUiMenuItem,
	Vec,
	toRichText,
	useIsToolSelected,
	useTools,
} from 'tldraw'
import 'tldraw/tldraw.css'

// Christmas emojis to use
const CHRISTMAS_EMOJIS = ['🎄', '🎅', '🎁', '🦌', '⛄', '❄️', '🎀', '🔔', '🌟', '🧦', '🍪', '🥛']

// Minimum distance between emojis (in pixels)
const MIN_DISTANCE = 40

// Random size variation range
const MIN_SIZE = 24
const MAX_SIZE = 48

function getRandomEmoji() {
	return CHRISTMAS_EMOJIS[Math.floor(Math.random() * CHRISTMAS_EMOJIS.length)]
}

function getRandomSize() {
	return MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE)
}

// The Christmas Emoji Brush Tool
class ChristmasEmojiBrushTool extends StateNode {
	static override id = 'christmas-emoji-brush'
	static override initial = 'idle'

	override onEnter() {
		this.editor.setCursor({ type: 'cross', rotation: 0 })
	}
}

// Idle state - waiting for pointer down
class Idle extends StateNode {
	static override id = 'idle'

	override onEnter() {
		this.editor.setCursor({ type: 'cross', rotation: 0 })
	}

	override onPointerDown(info: TLPointerEventInfo) {
		this.parent.transition('drawing', info)
	}

	override onCancel() {
		this.editor.setCurrentTool('select')
	}
}

// Drawing state - placing emojis as the user drags
class Drawing extends StateNode {
	static override id = 'drawing'

	private lastPoint: Vec | null = null
	private markId: string | null = null

	override onEnter() {
		this.markId = this.editor.markHistoryStoppingPoint('christmas-brush-start')
		const { currentPagePoint } = this.editor.inputs
		this.lastPoint = currentPagePoint.clone()

		// Place the first emoji
		this.placeEmoji(currentPagePoint)
	}

	override onPointerMove() {
		const { currentPagePoint } = this.editor.inputs

		if (this.lastPoint) {
			const distance = Vec.Dist(this.lastPoint, currentPagePoint)

			// Place emojis along the path at intervals
			if (distance >= MIN_DISTANCE) {
				// Calculate how many emojis to place
				const numEmojis = Math.floor(distance / MIN_DISTANCE)
				const direction = Vec.Sub(currentPagePoint, this.lastPoint).uni()

				for (let i = 1; i <= numEmojis; i++) {
					const point = Vec.Add(this.lastPoint, Vec.Mul(direction, i * MIN_DISTANCE))
					// Add a bit of randomness to the position
					const jitter = 10
					const jitteredPoint = new Vec(
						point.x + (Math.random() - 0.5) * jitter * 2,
						point.y + (Math.random() - 0.5) * jitter * 2
					)
					this.placeEmoji(jitteredPoint)
				}

				this.lastPoint = currentPagePoint.clone()
			}
		}
	}

	override onPointerUp() {
		this.complete()
	}

	override onCancel() {
		if (this.markId) {
			this.editor.bailToMark(this.markId)
		}
		this.parent.transition('idle')
	}

	override onComplete() {
		this.complete()
	}

	override onInterrupt() {
		this.complete()
	}

	private placeEmoji(point: Vec) {
		const emoji = getRandomEmoji()
		const size = getRandomSize()

		// Center the emoji on the point
		const offset = size / 2

		this.editor.createShape<TLTextShape>({
			type: 'text',
			x: point.x - offset,
			y: point.y - offset,
			props: {
				richText: toRichText(emoji),
				size: size > 36 ? 'xl' : size > 28 ? 'l' : 'm',
				autoSize: true,
			},
		})
	}

	private complete() {
		this.lastPoint = null
		this.markId = null
		this.parent.transition('idle')
	}
}

// Register child states
ChristmasEmojiBrushTool.children = () => [Idle, Drawing]

// UI Overrides to add the tool to the tools context
const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		tools['christmas-emoji-brush'] = {
			id: 'christmas-emoji-brush',
			icon: 'santa-hat',
			label: 'Christmas Brush',
			kbd: 'x',
			onSelect: () => {
				editor.setCurrentTool('christmas-emoji-brush')
			},
		}
		return tools
	},
}

// Custom components to add the tool to the toolbar
const components: TLComponents = {
	Toolbar: (props) => {
		const tools = useTools()
		const isChristmasBrushSelected = useIsToolSelected(tools['christmas-emoji-brush'])
		return (
			<DefaultToolbar {...props}>
				<TldrawUiMenuItem
					{...tools['christmas-emoji-brush']}
					isSelected={isChristmasBrushSelected}
				/>
				<DefaultToolbarContent />
			</DefaultToolbar>
		)
	},
	KeyboardShortcutsDialog: (props) => {
		const tools = useTools()
		return (
			<DefaultKeyboardShortcutsDialog {...props}>
				<DefaultKeyboardShortcutsDialogContent />
				<TldrawUiMenuItem {...tools['christmas-emoji-brush']} />
			</DefaultKeyboardShortcutsDialog>
		)
	},
}

// Custom asset URLs for the santa hat icon
const customAssetUrls: TLUiAssetUrlOverrides = {
	icons: {
		'santa-hat': '/santa-hat.svg',
	},
}

// The custom tools array
const customTools = [ChristmasEmojiBrushTool]

export default function ChristmasEmojiBrushExample() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				tools={customTools}
				initialState="christmas-emoji-brush"
				overrides={uiOverrides}
				components={components}
				assetUrls={customAssetUrls}
			/>
		</div>
	)
}
