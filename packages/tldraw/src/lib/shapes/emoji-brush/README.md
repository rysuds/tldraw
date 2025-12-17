# Christmas Emoji Brush Tool

A festive drawing tool that paints a trail of random Christmas-themed emojis along your stroke path.

## Features

- **Brush-like behavior**: Draw continuously by clicking and dragging
- **Christmas emojis only**: Randomly places emojis from a curated set of 15 Christmas-themed emojis
- **Proper spacing**: Emojis are placed 25 pixels apart for a natural brush feel
- **Toolbar integration**: Available in the lower toolbar with a Santa hat icon
- **Keyboard shortcut**: `Shift + E`

## Christmas Emoji Set

The tool randomly selects from these emojis:
- 🎅 Santa
- 🎄 Christmas tree
- 🎁 Gift
- ⛄ Snowman
- ❄️ Snowflake
- 🔔 Bell
- ⭐ Star
- 🕯️ Candle
- 🦌 Reindeer
- 🤶 Mrs. Claus
- 🎀 Ribbon
- 🧦 Stocking
- 🍪 Cookie
- 🥛 Milk
- ✨ Sparkles

## Architecture

### Shape Definition (`TLEmojiBrushShape`)
Located in `packages/tlschema/src/shapes/TLEmojiBrushShape.ts`

The shape stores an array of emoji placements, where each placement contains:
- `position`: VecModel with x, y, z coordinates
- `emoji`: The emoji character string
- `isComplete`: Whether drawing is finished
- `scale`: Shape scale for zoom-independent sizing

### Shape Util (`EmojiBrushShapeUtil`)
Located in `packages/tldraw/src/lib/shapes/emoji-brush/EmojiBrushShapeUtil.tsx`

Handles:
- Rendering emojis as SVG text elements
- Geometry calculation for selection/hit-testing
- Resize operations
- Export to SVG

### Tool Implementation (`EmojiBrushShapeTool`)
Located in `packages/tldraw/src/lib/shapes/emoji-brush/EmojiBrushShapeTool.ts`

State machine with two states:
- **Idle**: Waits for pointer down, shows crosshair cursor
- **Drawing**: Places emojis along pointer movement path

### Tool States

#### `Idle.ts`
- Listens for pointer down to start drawing
- Shows crosshair cursor
- Cancels back to select tool

#### `Drawing.ts`
- Tracks pointer movement
- Places new emoji when pointer moves more than spacing threshold
- Randomly selects emoji from Christmas set
- Completes shape on pointer up
- Supports maximum emoji limit (500 per shape)

## Usage

1. Click the Santa hat icon in the toolbar (or press `Shift + E`)
2. Click and drag on the canvas to draw with Christmas emojis
3. Release to complete the stroke
4. The shape will display a trail of randomly selected Christmas emojis

## Testing

Run tests with:
```bash
cd packages/tldraw
yarn test EmojiBrushShapeTool.test.ts
```

Tests verify:
- Shape creation on pointer down
- Emoji addition during pointer movement
- Shape completion on pointer up
- Only Christmas emojis are used
- Tool transitions (idle/drawing states)
