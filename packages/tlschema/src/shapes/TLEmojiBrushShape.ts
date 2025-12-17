import { T } from '@tldraw/validate'
import { VecModel, vecModelValidator } from '../misc/geometry-types'
import { createShapePropsMigrationSequence } from '../records/TLShape'
import { RecordProps } from '../recordsWithProps'
import { TLBaseShape } from './TLBaseShape'

/** @public */
export interface TLEmojiBrushPoint extends VecModel {
	/** Index of the emoji to use from the emoji set */
	emoji: string
}

/** @public */
export const EmojiBrushPoint: T.ObjectValidator<TLEmojiBrushPoint> = T.object({
	x: T.number,
	y: T.number,
	z: T.number.optional(),
	emoji: T.string,
})

/** @public */
export interface TLEmojiBrushShapeProps {
	points: TLEmojiBrushPoint[]
	isComplete: boolean
	scale: number
}

/** @public */
export type TLEmojiBrushShape = TLBaseShape<'emoji-brush', TLEmojiBrushShapeProps>

/** @public */
export const emojiBrushShapeProps: RecordProps<TLEmojiBrushShape> = {
	points: T.arrayOf(EmojiBrushPoint),
	isComplete: T.boolean,
	scale: T.nonZeroNumber,
}

/** @public */
export const emojiBrushShapeMigrations = createShapePropsMigrationSequence({
	sequence: [],
})
