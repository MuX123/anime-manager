/**
 * module-loader.js
 * ACG 收藏庫 - 模組系統 v1.0.0
 * 
 * 統一管理所有 JS 模組的載入、依賴和匯出
 */

(function() {
    'use strict';

    // ===== Module Registry =====
    window.Modules = {
        loaded: new Map(),
        loading: new Map(),
        callbacks: []
    };

    // ===== Module Definition =====
    window.defineModule = function(name, config) {
        const moduleConfig = {
            name: name,
            file: config.file || `${name}.js`,
            dependencies: config.dependencies || [],
            exports: config.exports || [],
            onLoad: config.onLoad || null,
            onError: config.onError || null,
            required: config.required !== false
        };

        window.Modules.loaded.set(name, {
            config: moduleConfig,
            loaded: false,
            exports: {}
        });

        console.log(`[Module] Defined: ${name} (deps: ${moduleConfig.dependencies.join(', ') || 'none'})`);
    };

    // ===== Get Module =====
    window.getModule = function(name) {
        return window.Modules.loaded.get(name);
    };

    // ===== Check Module Loaded =====
    window.isModuleLoaded = function(name) {
        const mod = window.Modules.loaded.get(name);
        return mod && mod.loaded;
    };

    // ===== Require Module =====
    window.requireModule = function(name) {
        if (!window.isModuleLoaded(name)) {
            console.error(`[Module] ${name} is not loaded!`);
            return null;
        }
        return window.Modules.loaded.get(name).exports;
    };

    // ===== Register All Modules =====
    function registerCoreModules() {
        // External libraries (loaded via CDN, register as dependencies)
        defineModule('fuse.js', {
            file: './js/fuse.basic.min.js',
            dependencies: [],
            exports: ['Fuse'],
            isExternal: true
        });

        defineModule('embla-carousel', {
            file: './js/embla-carousel.umd.js',
            dependencies: [],
            exports: ['EmblaCarousel'],
            isExternal: true
        });

        // Core modules (no dependencies)
        defineModule('config', { 
            file: './js/config.js',
            dependencies: [],
            exports: ['IS_PRODUCTION', 'API_CONFIG']
        });

        defineModule('github-pages-config', {
            file: './js/github-pages-config.js',
            dependencies: [],
            exports: ['checkConfiguration']
        });

        // Deprecated/unused - kept for reference
        defineModule('state', {
            file: './js/state.js',
            dependencies: [],
            exports: [],
            required: false // Not required for app to work
        });

        defineModule('logger', { 
            file: './js/logger.js',
            dependencies: ['config'],
            exports: ['log', 'warn', 'error']
        });

        defineModule('security', { 
            file: './js/security.js',
            dependencies: ['config'],
            exports: ['setupCSP', 'sanitizeInput']
        });

        defineModule('usability', { 
            file: './js/usability.js',
            dependencies: [],
            exports: []
        });

        defineModule('performance', { 
            file: './js/performance.js',
            dependencies: ['config'],
            exports: ['initPerformance', 'registerServiceWorker']
        });
    }

    function registerDataModules() {
        defineModule('supabase', { 
            file: './js/supabase.js',
            dependencies: ['config'],
            exports: ['supabaseManager']
        });

        defineModule('data-manager', { 
            file: './js/data-manager.js',
            dependencies: ['supabase'],
            exports: ['loadAnimeData', 'loadOptionsData', 'renderAdmin']
        });

        defineModule('analytics', {
            file: './js/analytics.js',
            dependencies: ['config'],
            exports: ['trackPageView', 'trackEvent']
        });

        defineModule('announcements', {
            file: './js/announcements.js',
            dependencies: ['supabase'],
            exports: ['loadAnnouncements', 'renderMarquee']
        });
    }

    function registerAdminModules() {
        defineModule('admin-panel', { 
            file: './js/admin-panel.js',
            dependencies: ['supabase', 'data-manager'],
            exports: ['AdminPanel']
        });

        defineModule('admin-manager', { 
            file: './js/admin-manager.js',
            dependencies: ['admin-panel', 'supabase'],
            exports: ['toggleAdminMode', 'renderAdmin', 'checkAndUpdateAdminStatus']
        });
    }

    function registerUIModules() {
        defineModule('img-utils', {
            file: './js/img-utils.js',
            dependencies: [],
            exports: ['lazyLoadImage', 'optimizeImage']
        });

        defineModule('ui-helpers', {
            file: './js/ui-helpers.js',
            dependencies: [],
            exports: ['showToast', 'renderEmptyState']
        });

        defineModule('translation', {
            file: './js/translation.js',
            dependencies: [],
            exports: ['autoCompleteAnimeData', 'showJikanSearchModal']
        });

        defineModule('render', { 
            file: './js/render.js',
            dependencies: ['data-manager'],
            exports: ['renderGrid', 'renderDetail', 'renderCard']
        });

        defineModule('render-app', { 
            file: './js/render-app.js',
            dependencies: ['render'],
            exports: ['renderApp']
        });

        defineModule('visual-engine', { 
            file: './js/visual-engine.js',
            dependencies: ['atmosphere'],
            exports: ['initVisualEngine']
        });

        defineModule('atmosphere', { 
            file: './js/atmosphere.js',
            dependencies: [],
            exports: ['CursorManager']
        });

        defineModule('background', { 
            file: './js/background.js',
            dependencies: [],
            exports: ['initBackground']
        });

        defineModule('event-handler', {
            file: './js/event-handler.js',
            dependencies: [],
            exports: ['bindEvents']
        });

        defineModule('ui-controller', {
            file: './js/ui-controller.js',
            dependencies: [],
            exports: ['initUIController']
        });
    }

    function registerAppModules() {
        defineModule('script', { 
            file: './js/script.js',
            dependencies: ['data-manager', 'render', 'render-app', 'admin-manager'],
            exports: ['startLoadingSimulation', 'openGatesAndHide', 'changeCursorTheme', 'changeZoomLevel', 'applyZoom']
        });

        defineModule('main', { 
            file: './js/main.js',
            dependencies: ['script'],
            exports: ['initApp']
        });
    }

    // ===== Initialize Module System =====
    function init() {
        console.log('[Module] Initializing module system...');
        
        registerCoreModules();
        registerDataModules();
        registerAdminModules();
        registerUIModules();
        registerAppModules();

        console.log('[Module] Registered modules:', window.Modules.loaded.size);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('modulesRegistered'));
    }

    // ===== Check Dependencies =====
    function checkDependencies(name) {
        const mod = window.Modules.loaded.get(name);
        if (!mod) return false;

        for (const dep of mod.config.dependencies) {
            if (!window.isModuleLoaded(dep)) {
                return false;
            }
        }
        return true;
    }

    // ===== Load Script =====
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ===== Load Module =====
    async function loadModule(name) {
        if (window.Modules.loading.get(name)) {
            return new Promise(resolve => {
                window.Modules.callbacks.push(resolve);
            });
        }

        const mod = window.Modules.loaded.get(name);
        if (!mod) {
            console.error(`[Module] Unknown module: ${name}`);
            return;
        }

        if (mod.loaded) return;

        window.Modules.loading.set(name, true);

        // Load dependencies first
        for (const dep of mod.config.dependencies) {
            if (!window.isModuleLoaded(dep)) {
                await loadModule(dep);
            }
        }

        try {
            console.log(`[Module] Loading: ${name} from ${mod.config.file}`);
            await loadScript(mod.config.file);
            
            mod.loaded = true;
            window.Modules.loading.delete(name);
            
            console.log(`[Module] Loaded: ${name}`);

            // Call onLoad callback
            if (mod.config.onLoad) {
                mod.config.onLoad();
            }

            // Notify waiting callbacks
            window.Modules.callbacks.forEach(cb => cb());
            window.Modules.callbacks = [];

            // Dispatch event
            window.dispatchEvent(new CustomEvent('moduleLoaded', { detail: { name } }));

        } catch (error) {
            console.error(`[Module] Failed to load ${name}:`, error);
            window.Modules.loading.delete(name);
            
            if (mod.config.onError) {
                mod.config.onError(error);
            }
            
            if (mod.config.required) {
                throw error;
            }
        }
    }

    // ===== Load All Modules =====
    async function loadAllModules() {
        const order = [
            // External libs first (CDN or local)
            'fuse.js', 'embla-carousel',
            // Config
            'github-pages-config',
            // Core
            'config', 'logger', 'security', 'usability', 'performance',
            // Data
            'supabase', 'data-manager', 'analytics', 'announcements',
            // UI
            'img-utils', 'ui-helpers', 'translation', 'render', 'render-app', 
            'atmosphere', 'background', 'visual-engine', 'event-handler', 'ui-controller',
            // Admin
            'admin-panel', 'admin-manager',
            // App
            'script', 'main'
        ];

        for (const name of order) {
            if (window.Modules.loaded.has(name)) {
                await loadModule(name);
            }
        }
    }

    // ===== Debug: List Missing Functions =====
    window.Modules.debug = {
        list: function() {
            console.log('===== Module Status =====');
            window.Modules.loaded.forEach((mod, name) => {
                console.log(`[${mod.loaded ? '✓' : '✗'}] ${name}: ${mod.config.dependencies.join(', ') || 'none'}`);
            });
        },
        
        checkMissing: function() {
            const requiredFuncs = [
                'toggleAdminMode', 'renderAdmin', 'checkAndUpdateAdminStatus',
                'AdminPanel', 'updateAdminMenu'
            ];
            
            console.log('===== Missing Functions =====');
            requiredFuncs.forEach(fn => {
                if (typeof window[fn] === 'undefined') {
                    console.error(`✗ MISSING: ${fn}`);
                } else {
                    console.log(`✓ FOUND: ${fn}`);
                }
            });
        }
    };

    // ===== Initialize =====
    init();

    // Auto-load in dev mode
    if (!window.IS_PRODUCTION) {
        // Don't auto-load, let HTML control loading order
        console.log('[Module] Manual loading enabled (set Modules.autoLoad = true to enable auto-load)');
    }

    window.Modules.autoLoad = false;
    window.loadAllModules = loadAllModules;
    window.loadModule = loadModule;
    window.checkDependencies = checkDependencies;

    // ===== Validation System =====
    window.Modules.validate = function() {
        console.log('===== Module Validation =====');
        const required = ['supabase', 'data-manager', 'admin-panel', 'admin-manager', 'render', 'render-app', 'script', 'main'];
        const missing = [];
        
        required.forEach(name => {
            const mod = window.Modules.loaded.get(name);
            if (!mod || !mod.loaded) {
                console.error(`✗ MISSING: ${name}`);
                missing.push(name);
            } else {
                console.log(`✓ LOADED: ${name}`);
            }
        });
        
        // Check critical functions
        console.log('\n===== Critical Functions =====');
        const funcs = [
            'toggleAdminMode', 'AdminPanel', 'renderAdmin',
            'loadData', 'renderApp', 'supabaseManager'
        ];
        
        funcs.forEach(fn => {
            if (typeof window[fn] === 'undefined') {
                console.error(`✗ MISSING: window.${fn}`);
            } else {
                console.log(`✓ FOUND: window.${fn}`);
            }
        });
        
        if (missing.length > 0) {
            console.error(`\n⚠️ ${missing.length} modules missing!`);
            return false;
        }
        
        console.log('\n✅ All modules validated!');
        return true;
    };

    // Auto-validate after all scripts loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (window.Modules && window.Modules.validate) {
                console.log('\n[Auto-validating modules...]');
                window.Modules.validate();
            }
        }, 1000);
    });

    console.log('[Module] Module system ready');

})();
