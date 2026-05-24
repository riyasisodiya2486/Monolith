// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useMotionTemplate } from 'motion/react';
import './OrbitImages.css';

function generateEllipsePath(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function generateCirclePath(cx, cy, r) {
  return generateEllipsePath(cx, cy, r, r);
}

function generateSquarePath(cx, cy, size) {
  const h = size / 2;
  return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
}

function generateRectanglePath(cx, cy, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
}

function generateTrianglePath(cx, cy, size) {
  const height = (size * Math.sqrt(3)) / 2;
  const hs = size / 2;
  return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
}

function generateStarPath(cx, cy, outerR, innerR, points) {
  const step = Math.PI / points;
  let path = '';
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path + ' Z';
}

function generateHeartPath(cx, cy, size) {
  const s = size / 30;
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
}

function generateInfinityPath(cx, cy, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
}

function generateWavePath(cx, cy, w, amplitude, waves) {
  const pts = [];
  const segs = waves * 20;
  const hw = w / 2;
  for (let i = 0; i <= segs; i++) {
    const x = cx - hw + (w * i) / segs;
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  for (let i = segs; i >= 0; i--) {
    const x = cx - hw + (w * i) / segs;
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(`L ${x} ${y}`);
  }
  return pts.join(' ') + ' Z';
}

function OrbitItem({
  item,
  index,
  totalItems,
  radiusXValue,
  radiusYValue,
  itemSizeValue,
  rotationValue,
  progress,
  fill,
  scaleStrength,
  focalPoint = 50,
  baseWidth,
}) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;

  const offsetPercentage = useTransform(progress, (p) => {
    return (((p + itemOffset) % 100) + 100) % 100;
  });

  const strengthVal = scaleStrength || useMotionValue(0);

  const itemScale = useTransform([offsetPercentage, strengthVal], ([rawPos, strength]) => {
    let dist = Math.abs(rawPos - focalPoint);
    if (dist > 50) dist = 100 - dist;

    let targetScale = 1;
    if (dist < 20) {
      const ratio = dist / 20;
      const cosCurve = (Math.cos(ratio * Math.PI) + 1) / 2;
      targetScale = 0.4 + (cosCurve * 0.6);
    } else {
      targetScale = 0.4;
    }

    return 1 - (strength as number) * (1 - targetScale);
  });

  const cx = baseWidth / 2;
  const cy = baseWidth / 2;

  // GPU ACCELERATED POSITIONING INSTEAD OF LAYOUT-TAXING OFFSET-PATH
  const x = useTransform([offsetPercentage, radiusXValue, itemSizeValue], ([pct, rx, size]) => {
    const angleRad = (pct / 100) * 2 * Math.PI;
    const itemX = cx + Math.cos(angleRad) * rx;
    return itemX - (size / 2);
  });

  const y = useTransform([offsetPercentage, radiusYValue, itemSizeValue], ([pct, ry, size]) => {
    const angleRad = (pct / 100) * 2 * Math.PI;
    const itemY = cy + Math.sin(angleRad) * ry;
    return itemY - (size / 2);
  });

  const rotateNeg = useTransform(rotationValue, r => `rotate(${-r}deg)`);

  return (
    <motion.div
      className="orbit-item"
      style={{
        width: itemSizeValue,
        height: itemSizeValue,
        x,
        y,
        scale: itemScale,
        zIndex: useTransform(itemScale, s => Math.round(s * 100)),
        pointerEvents: 'auto'
      }}
    >
      <motion.div style={{ transform: rotateNeg, width: '100%', height: '100%' }}>{item}</motion.div>
    </motion.div>
  );
}

export default function OrbitImages({
  images = [],
  altPrefix = 'Orbiting image',
  shape = 'ellipse',
  customPath = undefined,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  fill = true,
  width = 100,
  height = 100,
  className = '',
  showPath = false,
  pathColor = 'rgba(0,0,0,0.1)',
  pathWidth = 2,
  easing = 'linear',
  paused = false,
  centerContent = undefined,
  responsive = false,
  progressOverride = undefined,
  radiusXOverride = undefined,
  radiusYOverride = undefined,
  itemSizeOverride = undefined,
  rotationOverride = undefined,
  translateXOverride = undefined,
  focusStrength = undefined,
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const designCenterX = baseWidth / 2;
  const designCenterY = baseWidth / 2;

  const currentRadiusX = radiusXOverride || useMotionValue(radiusX);
  const currentRadiusY = radiusYOverride || useMotionValue(radiusY);
  const currentItemSize = itemSizeOverride || useMotionValue(itemSize);
  const currentRotation = rotationOverride || useMotionValue(rotation);
  const currentTranslateX = translateXOverride || useMotionValue(0);

  const pathValue = useTransform([currentRadiusX, currentRadiusY], ([rx, ry]) => {
    switch (shape) {
      case 'circle': return generateCirclePath(designCenterX, designCenterY, rx);
      case 'ellipse': return generateEllipsePath(designCenterX, designCenterY, rx, ry);
      case 'square': return generateSquarePath(designCenterX, designCenterY, rx * 2);
      case 'rectangle': return generateRectanglePath(designCenterX, designCenterY, rx * 2, ry * 2);
      case 'triangle': return generateTrianglePath(designCenterX, designCenterY, rx * 2);
      case 'star': return generateStarPath(designCenterX, designCenterY, rx, rx * starInnerRatio, starPoints);
      case 'heart': return generateHeartPath(designCenterX, designCenterY, rx * 2);
      case 'infinity': return generateInfinityPath(designCenterX, designCenterY, rx * 2, ry * 2);
      case 'wave': return generateWavePath(designCenterX, designCenterY, rx * 2, ry, 3);
      case 'custom': return customPath || generateCirclePath(designCenterX, designCenterY, rx);
      default: return generateEllipsePath(designCenterX, designCenterY, rx, ry);
    }
  });

  useEffect(() => {
    if (!responsive || !containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive, baseWidth]);

  const internalProgress = useMotionValue(0);

  useEffect(() => {
    if (paused || progressOverride) return;
    const controls = animate(internalProgress, direction === 'reverse' ? -100 : 100, {
      duration,
      ease: easing,
      repeat: Infinity,
      repeatType: 'loop',
    });
    return () => controls.stop();
  }, [internalProgress, duration, easing, direction, paused, progressOverride]);

  const activeProgress = progressOverride || internalProgress;
  const containerWidth = responsive ? '100%' : (typeof width === 'number' ? width : '100%');
  const containerHeight = responsive ? 'auto' : (typeof height === 'number' ? height : (typeof width === 'number' ? width : 'auto'));

  const textOpacity = focusStrength || useMotionValue(0);
  const textPointerEvents = useTransform(textOpacity, (v) => v > 0.5 ? "auto" : "none");

  const items = images.map((imgData, index) => {
    const isObject = typeof imgData === 'object' && imgData !== null;
    const src = isObject ? imgData.src : imgData;
    const label = isObject ? imgData.label : `${altPrefix} ${index + 1}`;
    const headline = isObject && imgData.headline ? imgData.headline : label;
    const description = isObject && imgData.description ? imgData.description : "An exclusive curated architectural masterpiece.";

    return (
      <div key={src} className="relative group w-full h-full flex items-center justify-center pointer-events-auto">
        <div className="w-full h-full rounded-full overflow-hidden shadow-2xl relative bg-neutral-900 shrink-0">
          <motion.img
            src={src}
            alt={label}
            draggable={false}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        {/* Right-aligned premium headline and short description tied to animation - dynamically fades in and out with scroll */}
        <motion.div 
          style={{ 
            opacity: textOpacity, 
            pointerEvents: textPointerEvents,
            scale: 1 / scale,
            originX: 0,
            originY: 0.5,
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
          }}
          className="absolute left-[111%] top-1/2 -translate-y-1/2 pl-5 flex flex-col items-start text-left w-[295px] select-none"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold mb-1 flex items-center gap-1.5 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" />
            0{index + 1} // {label}
          </div>
          <h4 className="font-serif text-[22px] md:text-[25px] text-slate-950 font-bold tracking-tight mb-2 leading-none whitespace-normal">
            {headline}
          </h4>
          <div className="w-12 h-[1.5px] bg-stone-300 mb-2.5" />
          <p className="font-sans text-[12px] md:text-[13px] text-slate-800 leading-snug font-semibold whitespace-normal max-w-[270px]">
            {description}
          </p>
        </motion.div>
      </div>
    );
  });

  return (
    <div ref={containerRef} className={`orbit-container ${className}`} style={{ width: containerWidth, height: containerHeight, aspectRatio: responsive ? '1 / 1' : undefined }} aria-hidden="true">
      <div className={responsive ? 'orbit-scaling-container orbit-scaling-container--responsive' : 'orbit-scaling-container'} style={{ width: responsive ? baseWidth : '100%', height: responsive ? baseWidth : '100%', transform: responsive ? `translate(-50%, -50%) scale(${scale})` : undefined }}>
        <motion.div className="orbit-rotation-wrapper" style={{ rotate: currentRotation, x: currentTranslateX }}>
          {showPath && (
             <svg width="100%" height="100%" viewBox={`0 0 ${baseWidth} ${baseWidth}`} className="orbit-path-svg">
              <path d={pathValue.get()} fill="none" stroke={pathColor} strokeWidth={pathWidth / scale} />
            </svg>
          )}
          {items.map((item, index) => (
            <OrbitItem
              key={index}
              item={item}
              index={index}
              totalItems={items.length}
              radiusXValue={currentRadiusX}
              radiusYValue={currentRadiusY}
              itemSizeValue={currentItemSize}
              rotationValue={currentRotation}
              progress={activeProgress}
              fill={fill}
              scaleStrength={focusStrength}
              focalPoint={50}
              baseWidth={baseWidth}
            />
          ))}
        </motion.div>
      </div>
      {centerContent && <div className="orbit-center-content">{centerContent}</div>}
    </div>
  );
}
