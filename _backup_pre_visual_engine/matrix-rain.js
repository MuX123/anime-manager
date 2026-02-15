/* Matrix Rain - Optimized */

(function () {
    // waiting for DOM
    if (typeof document === 'undefined') return;

    var c = document.getElementById("c");
    if (!c) {
        console.warn('[Matrix] Canvas not found');
        return;
    }

    var ctx = c.getContext("2d");
    if (!ctx) return;

    // matrix characters
    var matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    matrix = matrix.split("");

    var font_size = 12;
    var columns = 0;
    var drops = [];

    // making the canvas full screen
    function resizeCanvas() {
        // 使用實際文檔高度，覆蓋整個頁面
        var documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

        // 確保 canvas 高度覆蓋整個文檔
        c.height = documentHeight;
        c.width = window.innerWidth;

        // 更新列數
        columns = Math.ceil(c.width / font_size);

        // 重置 drops 陣列
        drops = [];
        for (var x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        // CSS handles positioning (fixed, top:0, left:0, z-index)
        // c.style.cssText = 'position:fixed;top:0;left:0;z-index:-5;pointer-events:none;';
    }

    resizeCanvas();

    // 確保在內容載入後重新調整大小
    window.addEventListener('load', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);

    let lastTime = 0;
    let fpsInterval = 50; // 20 FPS is enough for matrix rain
    let animationId = null;
    let isPaused = false;

    function draw(timeStamp) {
        if (isPaused) return;

        // Throttling for FPS control
        const elapsed = timeStamp - lastTime;
        if (elapsed < fpsInterval) {
            animationId = requestAnimationFrame(draw);
            return;
        }
        lastTime = timeStamp - (elapsed % fpsInterval);

        // translucent BG to show trail
        // Use darker fade for better performance (less overdraw artifacts)
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = "#00ff88"; // Green text
        ctx.font = font_size + "px monospace";

        for (var i = 0; i < drops.length; i++) {
            // Randomly skip some drops to save GPU cycles on low-end
            if (Math.random() > 0.5) {
                ctx.fillText(matrix[Math.floor(Math.random() * matrix.length)], i * font_size, drops[i] * font_size);
            } else {
                // Just advance without drawing occasionally
            }

            // sending the drop back to the top randomly after it has crossed the screen
            if (drops[i] * font_size > c.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        animationId = requestAnimationFrame(draw);
    }

    // Visibility API - Stop completely when not looking
    function handleVisibilityChange() {
        // Debugging: Always run
        // if (document.hidden) {
        //     isPaused = true;
        //     if (animationId) cancelAnimationFrame(animationId);
        // } else {
        isPaused = false;
        lastTime = performance.now();
        draw(lastTime);
        // }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial start
    if (!document.hidden) {
        draw(0);
    }

    console.log('[Matrix] Initialized (Optimized: RAF + VisibilityAware)');
})();