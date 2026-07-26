import { useState, useEffect, useRef, useCallback } from 'react';
import {
    getCanvasData,
    getCanvasInfo,
    getCanvasWebSocketPath,
    initializeCanvas,
} from '../api/CanvasApi';
import { useWebSocket } from './useWebSocket';

export const usePixelCanvas = (name, initialWidth, initialHeight) => {
    const canvasRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: initialWidth, height: initialHeight });
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [pixelData, setPixelData] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial setup and data loading
    useEffect(() => {
        const setupCanvas = async () => {
            try {
                await initializeCanvas(name, initialWidth, initialHeight);
                const info = await getCanvasInfo(name);
                setDimensions(info);

                setPixelData(await getCanvasData(name));
                setIsLoaded(true);
            } catch (err) {
                console.error(`Canvas [${name}]: Setup failed`, err);
            }
        };
        setupCanvas();
    }, [name, initialWidth, initialHeight]);

    // History tracking for Undo (Ctrl+Z)
    const undoStack = useRef([]);
    const currentStrokePixels = useRef(new Map()); // Map of "x_y" -> {r, g, b}

    // Capture original pixels before they are overwritten
    const trackPixelForUndo = useCallback((x, y) => {
        if (!pixelData) return;
        const key = `${x}_${y}`;
        if (!currentStrokePixels.current.has(key)) {
            const offset = (y * dimensions.width + x) * 3;
            if (offset + 2 < pixelData.length) { // Ensure offset is within bounds
                currentStrokePixels.current.set(key, {
                    x, y,
                    r: pixelData[offset],
                    g: pixelData[offset + 1],
                    b: pixelData[offset + 2]
                });
            }
        }
    }, [pixelData, dimensions.width]);

    // Buffer for batching brush updates
    const brushBuffer = useRef([]);
    const frameRef = useRef(null);

    // WebSocket real-time synchronization
    const onMessage = useCallback((event) => {
        setPixelData(prev => {
            if (!prev) return prev;
            const newData = new Uint8Array(prev);

            const applyPixel = (p) => {
                if (p.x < 0 || p.x >= dimensions.width || p.y < 0 || p.y >= dimensions.height) return;
                const offset = (p.y * dimensions.width + p.x) * 3;
                if (offset + 2 < newData.length) {
                    newData[offset] = p.r;
                    newData[offset + 1] = p.g;
                    newData[offset + 2] = p.b;
                }
            };

            const applyBrush = (b) => {
                const radius = Math.floor(b.radius / 2);
                const r_sq = radius * radius;

                for (let dy = -radius; dy <= radius; dy++) {
                    const py = b.y + dy;
                    if (py < 0 || py >= dimensions.height) continue;

                    for (let dx = -radius; dx <= radius; dx++) {
                        const px = b.x + dx;
                        if (px < 0 || px >= dimensions.width) continue;

                        if (dx * dx + dy * dy <= r_sq) {
                            applyPixel({ x: px, y: py, r: b.r, g: b.g, b: b.b });
                        }
                    }
                }
            };

            if (event.type === 'pixel') {
                applyPixel(event.data);
            } else if (event.type === 'batch') {
                event.data.forEach(applyPixel);
            } else if (event.type === 'brush') {
                applyBrush(event.data);
            }

            return newData;
        });
    }, [dimensions.height, dimensions.width]);

    const { start, send, isRunning } = useWebSocket(getCanvasWebSocketPath(name), { onMessage });

    useEffect(() => {
        if (isLoaded) {
            start();
        }
    }, [start, isLoaded]);

    // Undo logic
    const undo = useCallback(() => {
        let lastStroke;

        // Include a just-finished stroke even if React has not run the
        // isDrawing effect that normally commits it to history yet.
        if (currentStrokePixels.current.size > 0) {
            lastStroke = new Map(currentStrokePixels.current);
            currentStrokePixels.current.clear();
        } else {
            lastStroke = undoStack.current.pop();
        }

        if (!lastStroke) return;
        const pixelsToRestore = Array.from(lastStroke.values());

        if (isRunning) {
            send({
                type: 'batch',
                data: pixelsToRestore
            });
        }

        // Undo locally even if the socket is reconnecting.
        onMessage({ type: 'batch', data: pixelsToRestore });
    }, [send, isRunning, onMessage]);

    // Keyboard listener for Ctrl+Z
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo]);

    // Handle stroke boundaries (limit history to 50 strokes)
    useEffect(() => {
        if (!isDrawing && currentStrokePixels.current.size > 0) {
            undoStack.current.push(new Map(currentStrokePixels.current));
            if (undoStack.current.length > 50) undoStack.current.shift();
            currentStrokePixels.current.clear();
        }
    }, [isDrawing]);

    // Animation frame loop for geometric sync
    useEffect(() => {
        const processUpdates = () => {
            if (brushBuffer.current.length > 0 && isRunning) {
                // Send latest brush position in this frame
                const latest = brushBuffer.current[brushBuffer.current.length - 1];
                send({
                    type: 'brush',
                    data: latest
                });
                brushBuffer.current = [];
            }
            frameRef.current = requestAnimationFrame(processUpdates);
        };

        frameRef.current = requestAnimationFrame(processUpdates);
        return () => cancelAnimationFrame(frameRef.current);
    }, [send, isRunning]);

    // Safety flush on refresh
    useEffect(() => {
        const handleUnload = () => {
            if (brushBuffer.current.length > 0 && isRunning) {
                send({
                    type: 'brush',
                    data: brushBuffer.current[brushBuffer.current.length - 1]
                });
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [send, isRunning]);

    // Update HTML5 canvas when pixel data or resolution changes
    useEffect(() => {
        if (!pixelData || !canvasRef.current || !isLoaded) return;
        const ctx = canvasRef.current.getContext('2d');
        const imageData = ctx.createImageData(dimensions.width, dimensions.height);

        for (let i = 0; i < dimensions.width * dimensions.height; i++) {
            imageData.data[i * 4] = pixelData[i * 3];     // R
            imageData.data[i * 4 + 1] = pixelData[i * 3 + 1]; // G
            imageData.data[i * 4 + 2] = pixelData[i * 3 + 2]; // B
            imageData.data[i * 4 + 3] = 255;              // A
        }

        ctx.putImageData(imageData, 0, 0);
    }, [pixelData, isLoaded, dimensions]);

    const handleInteraction = (e) => {
        if (!isDrawing || !canvasRef.current || !isLoaded) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
        const clientY = (e.touches ? e.touches[0].clientY : e.clientY);

        const centerX = Math.floor((clientX - rect.left) / (rect.width / dimensions.width));
        const centerY = Math.floor((clientY - rect.top) / (rect.height / dimensions.height));

        if (centerX < 0 || centerX >= dimensions.width || centerY < 0 || centerY >= dimensions.height) return;

        // Parse hex color to RGB
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        const brushData = { x: centerX, y: centerY, radius: brushSize, r, g, b };

        // SYMMETRIC AUTHORITY: Instant local render
        const radius = Math.floor(brushSize / 2);
        const r_sq = radius * radius;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx * dx + dy * dy <= r_sq) {
                    const px = centerX + dx;
                    const py = centerY + dy;
                    if (px >= 0 && px < dimensions.width && py >= 0 && py < dimensions.height) {
                        trackPixelForUndo(px, py);
                        onMessage({
                            type: 'pixel',
                            data: { x: px, y: py, r, g, b }
                        });
                    }
                }
            }
        }

        // Queue for geometric uplink
        brushBuffer.current.push(brushData);
    };

    return {
        canvasRef,
        dimensions,
        color,
        setColor,
        brushSize,
        setBrushSize,
        isDrawing,
        setIsDrawing,
        isLoaded,
        handleInteraction,
        undo, // Expose for UI button if needed
    };
};
