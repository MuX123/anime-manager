# AGENTS.md - AI Agent Guidelines for ACG Anime Manager

## Project Overview

**ACG Anime Manager** is a vanilla JavaScript web application for managing anime/manga/movie collections. Built with Supabase backend, featuring cyberpunk UI aesthetics and modular JavaScript architecture.

**Tech Stack:**
- Frontend: Vanilla JavaScript (ES6+), HTML5, CSS3
- Backend: Supabase (PostgreSQL, Auth, Edge Functions)
- No build system (direct file serving)
- No test framework

---

## 1. Commands

### Running the Project
```bash
# Start local HTTP server (Python)
python -m http.server 8000

# Or with Node.js
npx http-server 8000
```

### No Lint/Build/Test Commands
This is a plain JavaScript project with **no build system**. 
- No ESLint, Prettier, or build tools configured
- No test framework (Jest, Vitest, etc.)

---

## 2. Code Style Guidelines

### File Structure
```
js/
├── main.js           # Entry point - system initialization
├── script.js         # Core utilities, loading animation
├── module-loader.js  # Custom module system (not ES6 modules)
├── data-manager.js   # Data layer - CRUD operations
├── render.js        # Card/item rendering
├── render-app.js    # Main app container rendering
├── event-handler.js # User input handling
├── supabase.js      # Supabase client wrapper
├── admin-panel.js   # Admin UI (new)
├── admin-manager.js # Admin functions
└── *.js             # Other utilities (atmosphere, background, etc.)
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `data-manager.js`, `render-app.js` |
| Classes | PascalCase | `class DataManager {}` |
| Functions | camelCase | `function getFilteredData() {}` |
| Constants | UPPER_SNAKE | `const MAX_ITEMS = 100;` |
| HTML IDs | camelCase | `id="app"`, `id="loading-screen"` |
| CSS Classes | kebab-case | `.system-menu`, `.menu-tab-content` |

### JavaScript Patterns

**Module Registration (Custom System):**
```javascript
// Register module
if (window.Modules) {
    window.Modules.loaded.set('module-name', {
        loaded: true,
        exports: { func1, func2 },
        timestamp: Date.now()
    });
    console.log('[Module] Registered: module-name');
}
```

**Global Functions (attached to window):**
```javascript
window.functionName = function() { ... };
window.anotherFunction = (param) => { ... };
```

**Class Definition:**
```javascript
class DataManager {
    constructor() {
        this.data = [];
        this.filters = {};
    }
    
    methodName() { ... }
}
```

### HTML/CSS Guidelines

**HTML:**
- Use semantic HTML5 elements
- IDs for main containers, classes for repeated elements
- Inline styles avoided (use CSS files)
- Data attributes for JavaScript hooks: `data-key="value"`

**CSS:**
- CSS variables in `css/variables.css`
- Modular CSS files per feature
- Use flexbox/grid for layout
- Follow existing class naming (kebab-case)

### Error Handling

**Try-Catch for Async:**
```javascript
async function fetchData() {
    try {
        const result = await somethingAsync();
        return result;
    } catch (err) {
        console.error('Fetch failed:', err);
        return fallbackValue;
    }
}
```

**No Silent Failures:**
```javascript
// BAD
catch (e) { }

// GOOD
catch (err) {
    console.error('Error details:', err);
    window.showToast('操作失敗，請重試', 'error');
}
```

**No Type Suppression:**
- Never use `// @ts-ignore`, `as any`, or `@ts-expect-error`
- This is JavaScript, not TypeScript - avoid `any` type logic

### String Templates
Use backticks for multiline strings:
```javascript
const html = `
    <div class="card">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
    </div>
`;
```

---

## 3. Existing Patterns

### Versioning (Cache Busting)
Add version query params to CSS/JS imports:
```html
<script src="./js/data-manager.js?v=20260216_v2"></script>
<link rel="stylesheet" href="./css/loader.css?v=20260213_v1">
```

### Console Logging
Use consistent log formats:
```javascript
console.log('[Module] Registered: data-manager');
console.log('✅ 資料載入完成, 筆數:', 275);
console.error('❌ 錯誤:', err);
```

### DOM Access
```javascript
// Get element
const el = document.getElementById('element-id');

// Query selector
const items = document.querySelectorAll('.card-item');

// Create element
const div = document.createElement('div');
div.innerHTML = `<span>${value}</span>`;
document.body.appendChild(div);
```

### Event Handling
```javascript
// Inline (in HTML)
onclick="window.functionName()"
oninput="window.handleInput(this.value)"

// JavaScript
element.addEventListener('click', () => { ... });
```

---

## 4. Important Notes

### Module Loading Order
The `index.html` script loading order matters. Modules are loaded manually via `module-loader.js`.

### Admin Functions
Two admin systems exist:
1. `admin-panel.js` + `admin-manager.js` - newer system (preferred)
2. Legacy inline code - being phased out

### Supabase Integration
- Client initialized in `supabase.js`
- Use `window.supabaseManager` for API calls
- Data operations via `window.dataManager`

### Performance Considerations
- No virtual DOM - direct DOM manipulation
- Use `document.createDocumentFragment()` for bulk inserts
- Debounce search input handlers
- Service Worker for caching (in `sw.js`)

---

## 5. Common Tasks

**Adding a new module:**
1. Create `js/new-module.js`
2. Add to `index.html` before `main.js`
3. Register with module system (optional)

**Fixing a bug:**
1. Identify the module in question
2. Make minimal changes
3. Test locally with `python -m http.server 8000`

**Adding new feature:**
1. Find similar existing code
2. Follow naming conventions
3. Add version suffix to file references
