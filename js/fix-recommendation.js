/**
 * 修復推薦和顏色問題的補丁
 */

// 修復所有 recommendation/recommendation 混用問題
(function fixRecommendationIssues() {
    // 等待 script.js 載入完成
    setTimeout(() => {
        if (typeof window.optionsData !== 'undefined') {
            // 確保 optionsData 中有正確的 recommendation 配置
            if (!window.optionsData.recommendation && window.optionsData.recommendation) {
                window.optionsData.recommendation = window.optionsData.recommendation;
                console.log('🔧 修復 recommendation 配置:', window.optionsData.recommendation);
            }
            
            // 確保 category_colors 中有正確的 recommendation 顏色
            if (window.optionsData.category_colors) {
                if (!window.optionsData.category_colors.recommendation && window.optionsData.category_colors.recommendation) {
                    window.optionsData.category_colors.recommendation = window.optionsData.category_colors.recommendation;
                    console.log('🎨 修復 recommendation 顏色:', window.optionsData.category_colors.recommendation);
                }
            }
        }
    }, 2000);
})();