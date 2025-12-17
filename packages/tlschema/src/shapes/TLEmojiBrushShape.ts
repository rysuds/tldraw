import { T } from '@tldraw/validate'
import { VecModel, vecModelValidator } from '../misc/geometry-types'
import { createShapePropsMigrationIds, createShapePropsMigrationSequence } from '../records/TLShape'
import { RecordProps } from '../recordsWithProps'
import { TLBaseShape } from './TLBaseShape'

/** @public */
export interface TLEmojiBrushEmojiPlacement {
	position: VecModel
	emoji: string
}

/** @public */
export const EmojiBrushEmojiPlacement: T.ObjectValidator<TLEmojiBrushEmojiPlacement> = T.object({
	position: vecModelValidator,
	emoji: T.string,
})

/** @public */
export interface TLEmojiBrushShapeProps {
	emojis: TLEmojiBrushEmojiPlacement[]
	isComplete: boolean
	scale: number
}

/** @public */
export type TLEmojiBrushShape = TLBaseShape<'emoji-brush', TLEmojiBrushShapeProps>

/** @public */
export const emojiBrushShapeProps: RecordProps<TLEmojiBrushShape> = {
	emojis: T.arrayOf(EmojiBrushEmojiPlacement),
	isComplete: T.boolean,
	scale: T.nonZeroNumber,
}

const Versions = createShapePropsMigrationIds('emoji-brush', {
	AddScale: 1,
})

export { Versions as emojiBrushShapeVersions }

/** @public */
export const emojiBrushShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: Versions.AddScale,
			up: (props) => {
				props.scale = 1
			},
			down: (props) => {
				delete props.scale
			},
		},
	],
})
