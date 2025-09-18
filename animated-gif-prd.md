# Product Requirements Document: Animated GIF Support for tldraw

## Executive Summary

This document outlines the implementation plan for adding animated GIF support to the tldraw whiteboard application. Currently, tldraw can detect animated images (GIF, APNG, AVIF, WebP) but only displays the first frame. This PRD details the changes needed to enable full animation playback within the canvas.

## Current State Analysis

### Image Rendering Architecture

The tldraw image rendering system consists of several key components:

1. **Image Shape (`ImageShapeUtil`)**: The main shape class that handles image rendering
   - Located in `packages/tldraw/src/lib/shapes/image/ImageShapeUtil.tsx`
   - Uses standard HTML `<img>` elements for rendering
   - Already detects animated images via `getIsAnimated()` function
   - Currently extracts and displays only the first frame of animated images

2. **Asset System**: Manages file storage and retrieval
   - `TLAssetStore` interface handles upload, resolution, and removal
   - Assets store metadata including `isAnimated` flag
   - Multiple implementations: in-memory, IndexedDB, cloud storage

3. **Animation Detection**: Robust detection for multiple formats
   - Supports GIF, APNG, AVIF, and WebP animations
   - Detection logic in `packages/utils/src/lib/media/`
   - Binary parsing to determine if images contain multiple frames

4. **Current Limitations**:
   - `getFirstFrameOfAnimatedImage()` extracts static frame for exports
   - SVG exports show only first frame (intentional for static output)
   - Reduced motion preference shows static frame
   - Cross-origin handling already in place for animated images

## Proposed Solution

### High-Level Approach

Enable animated GIF playback by removing the first-frame extraction for canvas rendering while maintaining static frames for exports and reduced motion scenarios.

### Technical Implementation

#### 1. Core Rendering Changes

**File**: `packages/tldraw/src/lib/shapes/image/ImageShapeUtil.tsx`

- Modify `ImageShape` component to conditionally show animated vs static content
- Keep existing static frame extraction for:
  - SVG exports
  - Reduced motion preference
  - Performance mode (new feature)
- Add animation controls (play/pause) to image shape UI

#### 2. Performance Optimizations

- Implement viewport-based animation pausing
- Add quality/performance settings for animation playback
- Consider frame rate limiting for large GIFs
- Memory management for multiple animated images

#### 3. User Experience Enhancements

- Add animation indicator overlay on animated images
- Implement play/pause controls on hover/selection
- Add preference setting for auto-play animations
- Consider animation timeline scrubber for precise control

#### 4. Asset Storage Updates

- No changes needed to asset storage (already stores full animated files)
- Ensure cloud storage providers maintain animation data
- Update asset metadata to include animation details (frame count, duration)

### Implementation Phases

#### Phase 1: Basic Animation Support (Week 1-2)
- Enable GIF animation playback in canvas
- Maintain static frames for exports
- Basic performance optimizations

#### Phase 2: Animation Controls (Week 2-3)
- Add play/pause UI controls
- Implement viewport-based pausing
- Add animation indicators

#### Phase 3: Advanced Features (Week 3-4)
- Performance settings and modes
- Animation timeline controls
- Batch animation management
- Testing and bug fixes

## Technical Specifications

### Modified Components

1. **ImageShape Component**
   ```typescript
   // Pseudocode for key changes
   const ImageShape = ({ shape }) => {
     const isAnimated = getIsAnimated(editor, asset.id)
     const shouldAnimate = isAnimated && !prefersReducedMotion && !isExporting
     
     if (shouldAnimate) {
       return <img src={originalAnimatedUrl} />
     } else {
       return <img src={staticFrameUrl} />
     }
   }
   ```

2. **Animation Control Interface**
   ```typescript
   interface AnimationControls {
     playing: boolean
     currentFrame?: number
     totalFrames?: number
     duration?: number
   }
   ```

3. **Performance Settings**
   ```typescript
   interface AnimationSettings {
     autoPlay: boolean
     maxSimultaneousAnimations: number
     pauseOffscreen: boolean
     qualityMode: 'high' | 'balanced' | 'performance'
   }
   ```

## Timeline & Effort Estimation

### Development Timeline (4 weeks)

**Week 1-2: Core Implementation**
- Implement basic GIF animation playback (3 days)
- Maintain export compatibility (2 days)
- Initial testing and debugging (2 days)
- Code review and iterations (3 days)

**Week 2-3: UI Controls & UX**
- Design and implement animation controls (3 days)
- Add animation indicators and overlays (2 days)
- Viewport-based optimization (2 days)
- Integration testing (3 days)

**Week 3-4: Polish & Performance**
- Performance optimization and settings (3 days)
- Edge case handling (2 days)
- Documentation and examples (2 days)
- Final testing and bug fixes (3 days)

### Resource Requirements

- 1 Senior Frontend Engineer (full-time)
- 0.5 UI/UX Designer (part-time for controls design)
- 0.25 QA Engineer (testing support)

### Risk Mitigation

1. **Performance Impact**
   - Risk: Multiple large GIFs causing performance issues
   - Mitigation: Implement aggressive viewport culling and quality settings

2. **Memory Usage**
   - Risk: Memory leaks from animated images
   - Mitigation: Proper cleanup and lifecycle management

3. **Cross-Browser Compatibility**
   - Risk: Animation behavior differences across browsers
   - Mitigation: Extensive cross-browser testing

4. **File Size Concerns**
   - Risk: Large animated GIFs impacting load times
   - Mitigation: Maintain existing lazy loading, add size warnings

## Success Metrics

1. **Performance**: No more than 10% FPS drop with 5 animated GIFs on screen
2. **Compatibility**: Works on all supported browsers
3. **User Satisfaction**: Positive feedback from beta users
4. **Stability**: No increase in crash reports

## Future Considerations

1. **Video Support**: Extend animation system to support video playback
2. **Animation Creation**: Built-in GIF creation from shape sequences
3. **Advanced Controls**: Frame-by-frame editing capabilities
4. **Optimization Service**: Server-side GIF optimization for better performance

## Conclusion

Adding animated GIF support to tldraw is a natural extension of the existing image handling system. The implementation is straightforward due to the well-architected codebase, with most changes localized to the ImageShape component. The phased approach ensures we can deliver value quickly while maintaining quality and performance standards.

The estimated 4-week timeline includes generous buffers for testing and iteration, ensuring a polished feature that enhances the tldraw experience without compromising performance or stability.