import React from 'react';
import { usePixelCanvas } from '../../hooks/usePixelCanvas';

const DISPLAY_SCALE = 4; // Scale factor for display

const PixelCanvas = ({ name, width = 64, height = 64 }) => {
    const {
        canvasRef,
        dimensions,
        color,
        setColor,
        brushSize,
        setBrushSize,
        setIsDrawing,
        isLoaded,
        handleInteraction,
        undo,
    } = usePixelCanvas(name, width, height);

    return (
        <div className="my-xl w-full">
            <div className="mx-auto w-full max-w-[1024px] border border-strong bg-primary">
                <div className="relative">
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/50 backdrop-blur-sm z-10 font-serif lowercase">
                        Initializing...
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="image-pixelated block h-auto w-full cursor-crosshair bg-white"
                    style={{
                        maxWidth: dimensions.width * DISPLAY_SCALE,
                        touchAction: 'none'
                    }}
                    onMouseDown={() => setIsDrawing(true)}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                    onMouseMove={handleInteraction}
                    onTouchStart={() => setIsDrawing(true)}
                    onTouchEnd={() => setIsDrawing(false)}
                    onTouchMove={handleInteraction}
                />
                </div>

            <div className="flex flex-wrap items-center justify-center gap-md border-t border-strong bg-secondary p-sm">
                <div className="flex items-center gap-sm">
                    <label className="text-xs font-semibold text-secondary">Ink:</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-7 w-7 cursor-pointer border border-default bg-transparent p-0"
                    />
                </div>

                <div className="h-4 w-px bg-strong/20 hidden sm:block"></div>

                <div className="flex items-center gap-sm">
                    <label className="text-xs font-semibold text-secondary">Brush:</label>
                    <select
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="border border-default bg-primary px-xs py-2xs font-serif text-xs"
                    >
                        <option value="1">1px</option>
                        <option value="2">2px</option>
                        <option value="3">3px</option>
                        <option value="5">5px</option>
                        <option value="10">10px</option>
                        <option value="20">20px</option>
                    </select>
                </div>

                <div className="h-4 w-px bg-strong/20 hidden sm:block"></div>

                <button
                    type="button"
                    onClick={undo}
                    className="group flex items-center gap-xs border border-transparent bg-transparent px-sm py-2xs hover:border-default hover:bg-primary"
                    title="Ctrl+Z to Undo"
                >
                    <span className="text-xs font-semibold text-secondary group-hover:text-strong">Undo</span>
                    <span className="font-serif text-xs opacity-60">ctrl+z</span>
                </button>

            </div>
            </div>
        </div>
    );
};

export default PixelCanvas;
