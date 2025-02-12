'use strict';

window.onload = function () {
    const canvas = document.getElementById('canvas');
    const mazeImg = document.getElementById('maze');
    const heroImg = document.getElementById('hero');

    if (!canvas || !mazeImg || !heroImg) {
        console.error('Один из элементов не найден!');
        return;
    }

    canvas.focus(); // Устанавливаем фокус на canvas

    // Ждем загрузки изображений
    mazeImg.onload = function () {
        heroImg.onload = function () {
            startGame(canvas, mazeImg, heroImg);
        };
    };

    // Если изображения уже загружены, запускаем игру сразу
    if (mazeImg.complete && heroImg.complete) {
        startGame(canvas, mazeImg, heroImg);
    }
};

function startGame(canvas, mazeImg, heroImg) {
    const context = canvas.getContext('2d', { willReadFrequently: true });

    const config = {
        heroSize: 8,
        heroColor: 'rgb(254,244,207)',
        wallColors: [
            { r: 0, g: 0, b: 0 },
        ],
        frameDelay: 5
    };

    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = 0;
    let frameCount = 0; // Счётчик кадров
    let isPaused = false;

    drawMaze(60, 4);

    function drawMaze(startX, startY) {
        canvas.width = mazeImg.width;
        canvas.height = mazeImg.height;
        context.drawImage(mazeImg, 0, 0);
        x = startX;
        y = startY;
        drawHero();
        window.requestAnimationFrame(drawFrame);
    }

    function drawHero() {
        context.drawImage(heroImg, x, y, config.heroSize, config.heroSize);
    }

    function processKey(e) {
        e.preventDefault();
        isPaused = false;
        const keyActions = {
            37: () => (dx = -1, dy = 0), // Влево
            38: () => (dx = 0, dy = -1), // Вверх
            39: () => (dx = 1, dy = 0),  // Вправо
            40: () => (dx = 0, dy = 1)   // Вниз
        };
        dx = 0;
        dy = 0;
        if (keyActions[e.keyCode]) {
            keyActions[e.keyCode]();
        }
    }

    window.onkeydown = processKey;

    function paused() {
        isPaused = true;
    }

    window.onkeyup = paused;

    function drawFrame() {
        frameCount++;
        if (dx !== 0 || dy !== 0) {
            if (frameCount % config.frameDelay === 0) {
                context.fillStyle = config.heroColor;
                context.fillRect(x, y, config.heroSize, config.heroSize);
                x += dx;
                y += dy;
                if (checkForCollision()) {
                    x -= dx;
                    y -= dy;
                    dx = 0;
                    dy = 0;
                }
                drawHero();
            }
            if (y > mazeImg.height) {
                alert('Ты победил!');
                return;
            }
        }
        window.requestAnimationFrame(drawFrame);
    }

    function checkForCollision() {
        const startX = Math.max(0, x - 1);
        const startY = Math.max(0, y - 1);
        const endX = Math.min(canvas.width, x + config.heroSize);
        const endY = Math.min(canvas.height, y + config.heroSize);
        const width = endX - startX;
        const height = endY - startY;

        if (isPaused) {
            return true;
        }

        if (y <= 2) {
            return true;
        }

        if (y >= canvas.height - config.heroSize) {
            return true;
        }

        if (width <= 0 || height <= 0) {
            return false;
        }

        const imgData = context.getImageData(startX, startY, width, height);
        const pixels = imgData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            const red = pixels[i];
            const green = pixels[i + 1];
            const blue = pixels[i + 2];

            for (const color of config.wallColors) {
                if (red === color.r && green === color.g && blue === color.b) {
                    return true;
                }
            }
        }
        return false;
    }
};
