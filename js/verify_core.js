/**
 * Core Logic Verification Script
 * Run this in the browser console to verify fixes.
 */

console.log('🧪 Starting Core Logic Verification...');

let errors = 0;
const assert = (condition, message) => {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        errors++;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
};

// 1. Check generateStars logic
try {
    const testCases = [
        { input: 5, expectedCount: 5 },
        { input: '3', expectedCount: 3 },
        { input: '★★★★', expectedCount: 4 },
        { input: null, expectedCount: 0 }, // Should handle null gracefully (default behavior checks)
        { input: 'invalid', expectedCount: 0 }
    ];

    testCases.forEach(tc => {
        const html = generateStars(tc.input);
        const litCount = (html.match(/star-glow/g) || []).length;
        // Note: generateStars currently returns 5 stars total, with some lit.
        // We check how many have 'star-glow' class.

        // For null/invalid, the function might return 0 or default to something else depending on implementation.
        // Looking at current code: parseInt('invalid') || 0 -> 0.

        assert(litCount === tc.expectedCount, `generateStars(${tc.input}) should have ${tc.expectedCount} lit stars. Got ${litCount}.`);
    });
} catch (e) {
    console.error('❌ CRITICAL: generateStars test crashed', e);
    errors++;
}

// 2. Check escapeHtml logic
try {
    const safeStr = escapeHtml('<script>alert(1)</script>');
    assert(!safeStr.includes('<script>'), 'escapeHtml should sanitize tags');
    assert(safeStr.includes('&lt;script&gt;'), 'escapeHtml should encode brackets');
} catch (e) {
    console.error('❌ CRITICAL: escapeHtml test crashed', e);
    errors++;
}

// 3. Check variable definitions in render context (Mock)
try {
    console.log('🔍 Static checking important variables...');
    // This is hard to test at runtime without invoking the function, 
    // but we can check if the function exists.
    assert(typeof window.showAnimeDetail === 'function', 'showAnimeDetail function exists');
} catch (e) {
    errors++;
}

if (errors === 0) {
    console.log('🎉 ALL LOGIC TESTS PASSED!');
    alert('✅ 代碼邏輯驗證通過！系統核心功能正常。');
} else {
    console.error(`⚠️ Found ${errors} errors during verification.`);
    alert(`❌ 驗證失敗：發現 ${errors} 個錯誤，請檢查控制台。`);
}
