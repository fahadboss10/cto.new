# Testpoints & Pinouts Directory

A modern, accessible web application for browsing and searching electronic device testpoints and pinout diagrams. Built with vanilla JavaScript, HTML5, and CSS3.

## Features

### 🎨 Modern UI Design
- Clean, professional interface with modern color palette
- Smooth transitions and animations
- Card-style brand filters with shadows and hover effects
- Improved spacing, padding, and typography hierarchy
- Enhanced dark mode with better contrast

### ⚡ Loading & Performance
- Skeleton screen loaders that mimic table layout
- Progressive loading with fade-in animations
- Per-brand loading states
- Visual progress indicator for multi-brand loads
- Optimized DOM manipulation

### 🔍 Search & Filtering
- Real-time search with debouncing
- Live result count updates
- Search term highlighting in results
- Brand-based filtering
- "No results" state with helpful messaging
- Clear filters functionality

### 📱 Mobile Responsive
- Adaptive card view on mobile devices
- Touch-friendly buttons (44x44px minimum)
- Responsive brand filter layout
- Mobile-optimized lightbox with touch controls
- Mobile-first design approach

### 🖼️ Image Lightbox
- Full-screen image viewer
- Zoom in/out/reset controls
- Pan support for zoomed images
- Touch and mouse support
- Keyboard shortcuts (+, -, 0, Escape)

### ♿ Accessibility
- ARIA labels on all interactive elements
- Full keyboard navigation support
- Focus indicators on all focusable elements
- Semantic HTML structure
- Screen reader friendly
- Alt text for all images

### 🛡️ Error Handling
- Graceful error states for failed API calls
- Retry buttons for failed loads
- Per-brand error tracking
- Image fallback support
- Timeout/connection error messages

### 🌙 Theme Support
- Light and dark mode
- Persistent theme preference
- Smooth theme transitions
- Optimized color contrast

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- WCAG 2.1 Level AA compliant
- Keyboard navigation (Tab, Enter, Escape, +/-, 0)
- Screen reader support with ARIA labels
- Focus management
- Reduced motion support
- High contrast mode compatible

## Performance Optimizations

- Debounced search input
- Lazy image loading
- CSS animations with GPU acceleration
- Efficient DOM updates
- Minimal dependencies (vanilla JS)

## Code Structure

```
project/
├── index.html          # Main HTML structure
├── styles.css          # All styles (responsive, dark mode, animations)
├── app.js             # Application logic (modular, well-commented)
└── README.md          # Documentation
```

## Key Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search input
- `Escape` - Close lightbox
- `+` or `=` - Zoom in (in lightbox)
- `-` - Zoom out (in lightbox)
- `0` - Reset zoom (in lightbox)
- `Tab` - Navigate between elements
- `Enter` - Activate focused element

## Development Notes

### Mock Data
Currently uses mock data generation for demonstration. In production:
- Replace `fetchBrandPinouts()` with actual API calls
- Update image URLs to real pinout diagrams
- Add proper error handling for network issues

### Customization
- Colors: Edit CSS variables in `:root` in `styles.css`
- Brands: Update `AppState.brands` array in `app.js`
- Layout: Modify grid configurations in `styles.css`

## Browser Requirements

- Modern browser with ES6+ support
- JavaScript enabled
- Local storage for theme persistence

## License

MIT License - Free to use and modify

## Contributing

Contributions welcome! Please ensure:
- Code follows existing style conventions
- Accessibility standards are maintained
- Mobile responsiveness is tested
- Comments explain complex logic
