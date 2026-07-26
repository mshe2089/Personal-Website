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
        <div className="flex flex-col items-center gap-lg my-xl">
            <div className="relative group p-xs bg-strong border-2 border-strong shadow-brutalist dark:shadow-brutalist-dark">
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/50 backdrop-blur-sm z-10 font-serif lowercase">
                        Initializing...
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="image-pixelated cursor-crosshair bg-white"
                    style={{
                        width: dimensions.width * DISPLAY_SCALE,
                        height: dimensions.height * DISPLAY_SCALE,
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

            <div className="flex flex-wrap items-center justify-center gap-md bg-secondary p-md border border-strong rounded shadow-sm w-full max-w-lg">
                <div className="flex items-center gap-sm">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Ink:</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 cursor-pointer border-2 border-strong bg-transparent p-0"
                    />
                </div>

                <div className="h-4 w-px bg-strong/20 hidden sm:block"></div>

                <div className="flex items-center gap-sm">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Brush:</label>
                    <select
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="bg-primary border-2 border-strong font-serif text-xs px-xs py-2xs"
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
                    onClick={undo}
                    className="flex flex-col items-center group px-sm py-2xs hover:bg-strong/5 transition-colors rounded border-2 border-transparent hover:border-strong/10"
                    title="Ctrl+Z to Undo"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary group-hover:text-strong">Undo</span>
                    <span className="text-[9px] opacity-60 font-serif">ctrl+z</span>
                </button>

                <div className="h-4 w-px bg-strong/20 hidden sm:block"></div>

                <div className="text-center">
                    <p className="font-serif text-sm uppercase font-bold tracking-tight">{name.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-secondary lowercase opacity-70 italic">
                        {dimensions.width}x{dimensions.height} grid / real-time sync
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PixelCanvas;
