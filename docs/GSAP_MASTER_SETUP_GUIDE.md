# GSAP Master MCP Server Setup Guide

## Overview

The GSAP Master MCP Server is now integrated into your project! This comprehensive guide will help you understand, configure, and use this powerful animation tool.

## What is GSAP Master MCP Server?

The GSAP Master MCP Server is the most comprehensive GSAP (GreenSock Animation Platform) MCP server ever created. It transforms Claude into a surgical precision animation expert with:

- 🧠 AI-powered intent analysis
- ⚡ Complete GSAP API coverage  
- 🎯 Production-ready patterns
- 📱 Mobile-optimized animations
- 🎨 Framework-specific code generation

> 🎉 **ALL GSAP PLUGINS NOW 100% FREE** thanks to Webflow! Including SplitText, MorphSVG, DrawSVG, and more!

## Installation Status

✅ **Already Configured**: The GSAP Master MCP Server is already added to your `mcp.json` configuration:

```json
"gsap-master": {
  "command": "npx",
  "args": [
    "-y",
    "bruzethegreat-gsap-master-mcp-server@latest"
  ]
}
```

## Available Tools

The GSAP Master MCP Server provides 6 powerful tools:

### 1. 🧠 AI Animation Creator (`understand_and_create_animation`)
Create animations from natural language descriptions:
- *"Fade in portfolio cards one by one when scrolling"*
- *"Create a hero title that reveals character by character"*
- *"Build smooth hover effects for navigation"*

### 2. 📚 GSAP API Expert (`get_gsap_api_expert`)
Complete documentation for every GSAP feature:
- Core methods (gsap.to, timeline, etc.)
- All plugins (ScrollTrigger, SplitText, DrawSVG, MorphSVG, Draggable)
- Performance tips and best practices

### 3. 🛠️ Complete Setup Generator (`generate_complete_setup`)
One-command environment setup:
- React, Next.js, Vue, Nuxt, Svelte, Vanilla
- All plugins and dependencies
- Performance configurations

### 4. 🔧 Expert Debugger (`debug_animation_issue`)
AI-powered troubleshooting:
- Performance issues (lag, stuttering)
- Mobile compatibility problems
- ScrollTrigger positioning issues

### 5. ⚡ Performance Optimizer (`optimize_for_performance`)
Transform any animation for maximum smoothness:
- 60fps desktop optimization
- Mobile-smooth variants
- Battery-efficient versions

### 6. 🎨 Production Patterns (`create_production_pattern`)
Battle-tested animation systems:
- Hero sections with layered animations
- Complete scroll systems
- Advanced text effects

## Usage Examples

### Create a Hero Section Animation
```
Use the understand_and_create_animation tool to create a hero section with parallax background, staggered text reveals, and floating CTA button
```

### Debug Performance Issues
```
Use the debug_animation_issue tool with: "My animations are laggy on mobile Safari"
```

### Generate React Setup
```
Use the generate_complete_setup tool for React with ScrollTrigger and SplitText plugins
```

## Animation Types Supported

- **Scroll-Based**: Parallax, reveals, pins, progress bars
- **Text Effects**: Character reveals, typewriter, morphing
- **Interactive**: Hover, click, drag, touch gestures
- **SVG Animations**: Path drawing, shape morphing, motion paths
- **Complex Sequences**: Choreographed timelines, scene transitions
- **Data Visualization**: Charts, counters, progress indicators

## Framework Support

The GSAP Master MCP Server supports all major frameworks:

- **React** - With hooks and component integration
- **Vue** - With composition API and directives
- **Next.js** - With SSR optimization
- **Nuxt** - With Vue ecosystem integration
- **Svelte** - With reactive animations
- **Vanilla JS** - Pure JavaScript implementations

## Performance Features

### 60fps Guaranteed
Every animation is optimized for 60fps performance:
- GPU acceleration techniques
- Transform property optimization
- Memory leak prevention
- Mobile-responsive by default

### Mobile Optimization
- Touch-friendly interactions
- Battery-efficient animations
- Reduced motion support
- Performance monitoring

## Testing the Installation

To test if the GSAP Master MCP Server is working correctly, run:

```bash
node test-gsap-master-mcp.js
```

This will:
1. Test server connectivity
2. Verify all 6 tools are available
3. Test animation creation functionality
4. Generate a detailed report

## Integration with Your Project

The GSAP Master MCP Server integrates seamlessly with your existing project:

### For React Components
```jsx
// The server can generate React-specific GSAP code
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

### For Vue Components
```vue
<script setup>
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
</script>
```

### For Vanilla JavaScript
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

## Common Use Cases

### 1. Hero Section Animations
- Parallax backgrounds
- Staggered text reveals
- Floating elements
- Call-to-action animations

### 2. Portfolio Showcases
- Card hover effects
- Grid animations
- Image reveals
- Interactive galleries

### 3. Scroll-Based Animations
- Progress indicators
- Section reveals
- Parallax scrolling
- Timeline animations

### 4. Interactive Elements
- Button animations
- Form interactions
- Navigation effects
- Micro-interactions

## Best Practices

### Performance
- Use transform properties (x, y, scale, rotation) for GPU acceleration
- Set `will-change: transform` for animated elements
- Use `force3D: true` for complex animations
- Implement reduced motion support

### Mobile Considerations
- Test on actual devices
- Use touch-friendly interactions
- Optimize for battery life
- Consider reduced motion preferences

### Code Organization
- Keep animations in separate files
- Use consistent naming conventions
- Document animation purposes
- Implement cleanup functions

## Troubleshooting

### Common Issues

1. **Server Not Responding**
   - Check if npx is working: `npx --version`
   - Verify internet connection
   - Try clearing npm cache: `npm cache clean --force`

2. **Animation Performance Issues**
   - Use the `debug_animation_issue` tool
   - Check for memory leaks
   - Optimize for mobile devices

3. **Framework Integration Problems**
   - Use the `generate_complete_setup` tool
   - Check plugin registration
   - Verify import statements

### Getting Help

- Use the `get_gsap_api_expert` tool for documentation
- Use the `debug_animation_issue` tool for troubleshooting
- Check the [GSAP Master GitHub Repository](https://github.com/bruzethegreat/gsap-master-mcp-server)

## Next Steps

1. **Test the Installation**: Run the test script to verify everything is working
2. **Explore the Tools**: Try each of the 6 available tools
3. **Create Your First Animation**: Use the `understand_and_create_animation` tool
4. **Optimize for Performance**: Use the performance optimization tools
5. **Build Production Patterns**: Create reusable animation systems

## Resources

- [GSAP Official Documentation](https://greensock.com/docs/)
- [GSAP Master MCP Server Repository](https://github.com/bruzethegreat/gsap-master-mcp-server)
- [GSAP Learning Center](https://greensock.com/learning/)
- [GSAP Community Forum](https://greensock.com/community/)

---

**🎯 You're now ready to create amazing animations with surgical precision!** 

The GSAP Master MCP Server is your gateway to professional-grade animations that will make your projects stand out. Start with simple animations and gradually work your way up to complex, production-ready animation systems.










