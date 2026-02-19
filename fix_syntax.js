const fs = require('fs');
const path = 'js/admin-manager.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    const oldSignature = 'window.applyJikanData = async (index) => {';
    // Use concatenation
    const newBody = "window.applyJikanData = async (index) => {\n" +
        "    const item = window._jikanSearchResults?.[index];\n" +
        "    if (!item) return;\n" +
        "\n" +
        "    document.getElementById('jikan-modal')?.remove();\n" +
        "    window.showToast('⌛ 補全資料中...', 'info');\n" +
        "\n" +
        "    try {\n" +
        "        if (document.getElementById('form-poster')) document.getElementById('form-poster').value = item.images?.jpg?.large_image_url || '';\n" +
        "        if (document.getElementById('form-episodes')) document.getElementById('form-episodes').value = item.episodes || '';\n" +
        "        if (document.getElementById('form-desc')) document.getElementById('form-desc').value = item.synopsis || '';\n" +
        "\n" +
        "        if (item.trailer?.url && document.getElementById('form-youtube')) {\n" +
        "            document.getElementById('form-youtube').value = item.trailer.url;\n" +
        "        }\n" +
        "\n" +
        "        // Try to map genres\n" +
        "        const genreCheckboxes = document.querySelectorAll('input[name=\"form-genre\"]');\n" +
        "        const apiGenres = item.genres?.map(g => g.name.toLowerCase()) || [];\n" +
        "\n" +
        "        genreCheckboxes.forEach(cb => {\n" +
        "            const val = cb.value.toLowerCase();\n" +
        "            if (apiGenres.some(ag => ag.includes(val) || val.includes(ag))) {\n" +
        "                cb.checked = true;\n" +
        "                if (cb.parentElement) {\n" +
        "                    cb.parentElement.style.background = 'rgba(0,212,255,0.1)';\n" +
        "                    cb.parentElement.style.borderColor = 'var(--neon-cyan)';\n" +
        "                }\n" +
        "            }\n" +
        "        });\n" +
        "\n" +
        "        // 嘗試自動抓取劇照 (Gallery Pictures)\n" +
        "        if (item.mal_id && document.getElementById('form-gallery')) {\n" +
        "            window.showToast('📸 正在抓取詳細劇照...', 'info');\n" +
        "            try {\n" +
        "                // Fixed backtick issue by using concatenation\n" +
        "                const picResp = await fetch('https://api.jikan.moe/v4/anime/' + item.mal_id + '/pictures');\n" +
        "                const picData = await picResp.json();\n" +
        "                if (picData.data && picData.data.length > 0) {\n" +
        "                    // 取前 6 張大圖\n" +
        "                    const imageUrls = picData.data.slice(0, 6).map(img => img.jpg.large_image_url || img.jpg.image_url);\n" +
        "                    document.getElementById('form-gallery').value = imageUrls.join('\\n');\n" +
        "                    window.showToast('✓ 已自動抓取 ' + imageUrls.length + ' 張劇照');\n" +
        "                }\n" +
        "            } catch (picErr) {\n" +
        "                console.warn('無法抓取劇照:', picErr);\n" +
        "            }\n" +
        "        }\n" +
        "\n" +
        "        window.showToast('✓ 已自動補全部分資料');\n" +
        "    } catch (err) {\n" +
        "        window.showToast('✗ 補全資料失敗', 'error');\n" +
        "    }\n" +
        "};";

    const startIndex = content.indexOf(oldSignature);
    if (startIndex !== -1) {
        // Find end of function
        // Heuristic: start of next function or end of file?
        // Let's search for "window.renderOptionsManager =" which seems to be the next big block
        const nextFunc = content.indexOf('window.renderOptionsManager =', startIndex);

        // Wait, looking at file view in Step 486:
        // window.applyJikanData is followed by // ===== Options Manager Functions ===== at line 1044
        // line 1046: window.renderOptionsManager = ...

        let endIndex = nextFunc;
        if (endIndex === -1) {
            // Fallback
            endIndex = content.length;
        }

        // We need to act carefully. applyJikanData ends with };
        // We can just find the last }; before window.renderOptionsManager?
        // Or search for `// ===== Options Manager Functions =====`
        const delimiter = '// ===== Options Manager Functions =====';
        const delimiterIndex = content.indexOf(delimiter, startIndex);

        if (delimiterIndex !== -1) {
            endIndex = delimiterIndex;
        }

        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex);

        const finalContent = before + newBody + '\n\n' + after;

        fs.writeFileSync(path, finalContent, 'utf8');
        console.log('applyJikanData replaced successfully.');
    } else {
        console.log('Could not find applyJikanData signature.');
    }

} catch (err) {
    console.error(err);
}
