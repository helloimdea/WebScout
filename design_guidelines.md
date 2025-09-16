# Design Guidelines for Web Proxy Application

## Design Approach
**Selected Approach**: Reference-Based Design inspired by modern developer tools like Vercel, Netlify, and GitHub with dark-first aesthetics.

**Justification**: This utility-focused application requires clarity and efficiency while maintaining visual appeal for developer users who expect polished tooling interfaces.

## Core Design Elements

### Color Palette
**Dark Mode Primary** (default):
- Background: 220 15% 8%
- Surface: 220 15% 12% 
- Border: 220 15% 20%
- Text Primary: 220 10% 95%
- Text Secondary: 220 10% 70%
- Accent: 220 90% 65% (vibrant blue for interactive elements)

**Light Mode**:
- Background: 220 15% 98%
- Surface: 220 15% 100%
- Border: 220 15% 85%
- Text Primary: 220 15% 15%
- Text Secondary: 220 15% 45%

### Typography
- **Primary Font**: Inter or system fonts via Google Fonts
- **Headers**: Semi-bold (600), larger scale for clear hierarchy
- **Body**: Regular (400) for optimal readability
- **Code/URLs**: Monospace font for URL input field

### Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, and 12 consistently
- Small gaps: p-2, m-2
- Standard spacing: p-4, m-4, gap-4
- Section spacing: p-6, m-6
- Large containers: p-8, m-8
- Major sections: p-12, m-12

### Component Library

**Primary Layout**:
- Single-column centered design with max-width container
- Header with app title and minimal branding
- Main proxy form section prominently featured
- Results area with iframe container

**Form Components**:
- Large, prominent URL input field with rounded borders
- Primary action button with subtle glow effect on hover
- Loading states with spinner animations
- Error messaging with clear visual hierarchy

**Results Display**:
- Full-width iframe container with subtle border
- Loading overlay with animated spinner
- Error states with retry functionality
- Responsive iframe sizing with aspect ratio preservation

**Interactive Elements**:
- Buttons: Rounded corners, smooth hover transitions
- Input fields: Focus states with accent color borders
- Subtle shadows on elevated surfaces
- Smooth transitions (200-300ms) for state changes

### Visual Treatments
**Gradients**: Minimal use - subtle gradient on primary button background
**Shadows**: Soft, low-opacity shadows for depth without distraction
**Borders**: Consistent 1px borders with rounded corners (4-6px radius)
**Loading States**: Skeleton screens and spinner animations for better perceived performance

### Accessibility Features
- High contrast ratios in both light and dark modes
- Focus indicators for keyboard navigation
- Screen reader friendly labels and ARIA attributes
- Consistent dark mode implementation across all form elements

### Key Design Principles
1. **Clarity First**: Clean, uncluttered interface prioritizing the core proxy functionality
2. **Developer-Focused**: Familiar patterns from popular developer tools
3. **Performance Feedback**: Clear loading and error states for proxy operations
4. **Responsive Design**: Mobile-friendly layout that works across devices
5. **Accessibility**: WCAG compliant with proper contrast and navigation support

This design creates a professional, efficient proxy tool that feels familiar to developers while maintaining visual appeal and usability across different use cases.