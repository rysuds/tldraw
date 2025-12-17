import { RecordProps, T, TLBaseShape } from '@tldraw/editor'

/** @public */
export interface TLEmojiBrushEmoji {
	x: number
	y: number
	emoji: string
}

/** @public */
export const emojiBrushEmojiValidator: T.ObjectValidator<TLEmojiBrushEmoji> = T.object({
	x: T.number,
	y: T.number,
	emoji: T.string,
})

/** @public */
export interface TLEmojiBrushShapeProps {
	emojis: TLEmojiBrushEmoji[]
	isComplete: boolean
	scale: number
}

/** @public */
export type TLEmojiBrushShape = TLBaseShape<'emoji-brush', TLEmojiBrushShapeProps>

/** @public */
export const emojiBrushShapeProps: RecordProps<TLEmojiBrushShape> = {
	emojis: T.arrayOf(emojiBrushEmojiValidator),
	isComplete: T.boolean,
	scale: T.nonZeroNumber,
}
