# Create Unit Test

Creates a consistent unit test file following tldraw's testing conventions.

## Usage

When you want to create a unit test for a file, use this command. It will:
1. Determine the correct test file location based on the source file
2. Generate a test file following tldraw's patterns
3. Include proper imports and test structure

## Test File Naming Rules

- **Unit tests**: Named after the file they test
  - `src/lib/LicenseManager.ts` → `src/lib/LicenseManager.test.ts`
- **Integration tests**: Live in `src/test/` directory
  - `src/test/selection.test.ts` (tests selection logic across multiple files)

## Test Structure

Based on existing tests in the tldraw repo, unit tests should follow this pattern:

```typescript
import { functionToTest } from './module'

describe('functionToTest', () => {
	it('should do something specific', () => {
		// Arrange
		const input = 'test'
		
		// Act
		const result = functionToTest(input)
		
		// Assert
		expect(result).toEqual('expected')
	})

	it('should handle edge cases', () => {
		// Test edge cases
	})
})
```

## Common Patterns

### Testing with Jest Mocks
```typescript
jest.useFakeTimers()

describe('debouncedFunction', () => {
	it('should debounce calls', () => {
		const fn = jest.fn()
		const debounced = debounce(fn, 100)
		debounced()
		expect(fn).not.toHaveBeenCalled()
		jest.advanceTimersByTime(200)
		expect(fn).toHaveBeenCalledTimes(1)
	})
})
```

### Testing React Components (for tldraw package)
```typescript
import { renderTldrawComponent } from '../test/testutils/renderTldrawComponent'
import { screen } from '@testing-library/react'

describe('<Component />', () => {
	it('Renders without crashing', async () => {
		await renderTldrawComponent(<Component />, { waitForPatterns: true })
		await screen.findByTestId('test-id')
	})
})
```

### Testing Editor Commands (for tldraw package)
```typescript
import { TestEditor } from '../TestEditor'
import { createShapeId } from '@tldraw/editor'

let editor: TestEditor

beforeEach(() => {
	editor = new TestEditor()
})

describe('commandName', () => {
	it('should execute command correctly', () => {
		editor.commandName(...)
		expect(editor.getShape(...)).toBeDefined()
	})
})
```

### Cleanup Patterns
```typescript
describe('functionName', () => {
	afterEach(() => {
		cleanupFunction()
		jest.restoreAllMocks()
	})
})
```

## Important Notes

1. **Editor vs Tldraw Package**: When testing the editor, if you need tldraw's default shapes and tools, write your tests in the `tldraw` workspace, not the `editor` workspace.

2. **Running Tests**: Run tests for a specific package using `yarn test` within that workspace's directory (e.g., `cd packages/editor && yarn test`).

3. **Test Organization**: 
   - Unit tests test a single file/module
   - Integration tests test multiple files/modules together and go in `src/test/`

4. **Jest Configuration**: The repo uses Jest for unit tests. Use standard Jest matchers like `expect().toEqual()`, `expect().toHaveBeenCalled()`, etc.

5. **TypeScript**: All tests are written in TypeScript. Use proper types and leverage TypeScript's type checking in tests when appropriate.

## Example Test Generation

When creating a test for `packages/utils/src/lib/debounce.ts`:

1. Test file location: `packages/utils/src/lib/debounce.test.ts`
2. Import the function: `import { debounce } from './debounce'`
3. Use `describe()` for the function/module name
4. Use `it()` for individual test cases
5. Follow AAA pattern (Arrange, Act, Assert) when helpful
6. Use descriptive test names that explain what is being tested

## Prompt Template

When you want to create a unit test, use this prompt:

```
Create a unit test file for [FILE_PATH] following tldraw's testing conventions:
- Use the naming convention: [FILE_NAME].test.ts in the same directory
- Follow the patterns from existing tests in the repo
- Include proper imports and test structure
- Test all exported functions/methods
- Include edge cases and error handling
- Reference @.cursor/rules/tests.mdc for naming and organization rules
```

Replace `[FILE_PATH]` with the actual file path and `[FILE_NAME]` with the base filename.

