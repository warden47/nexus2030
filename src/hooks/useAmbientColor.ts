// hooks/useAmbientColor.ts
'use client';

import { useEffect, useRef, useState } from 'react';

interface AmbientColor {
  r: number;
  g: number;
  b: number;
  hex: string;
  cssColor: string;
}

function componentToHex(c: number): string {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function useAmbientColor(videoRef: React.RefObject<HTMLVideoElement | null>): AmbientColor {
  const [color, setColor] = useState<AmbientColor>({
    r: 0,
    g: 0,
    b: 0,
    hex: '#000000',
    cssColor: 'rgb(0, 0, 0)',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    // Create offscreen canvas once
    canvasRef.current = document.createElement('canvas');
    canvasRef.current.width = 100;
    canvasRef.current.height = 100;
    ctxRef.current = canvasRef.current.getContext('2d');

    const sampleColor = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.paused) return;

      const ctx = ctxRef.current;
      if (!ctx) return;

      try {
        // Draw the center crop of the video frame onto the 100x100 canvas
        ctx.drawImage(
          video,
          (video.videoWidth - 100) / 2,
          (video.videoHeight - 100) / 2,
          100,
          100,
          0,
          0,
          100,
          100
        );

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;
        let r = 0,
          g = 0,
          b = 0;
        const total = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        r = Math.round(r / total);
        g = Math.round(g / total);
        b = Math.round(b / total);

        const hex = rgbToHex(r, g, b);
        const cssColor = `rgb(${r}, ${g}, ${b})`;

        setColor({ r, g, b, hex, cssColor });
      } catch (err) {
        // Canvas drawing may fail (e.g., cross-origin media without CORS)
        // Silently ignore
      }
    };

    const loop = (timestamp: number) => {
      // Throttle to 500ms
      if (timestamp - lastUpdateRef.current >= 500) {
        sampleColor();
        lastUpdateRef.current = timestamp;
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };

    // Start the loop when the video element is available
    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', () => {
        rafIdRef.current = requestAnimationFrame(loop);
      });
      video.addEventListener('pause', () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      });
      video.addEventListener('ended', () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      });
    }

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      // Remove event listeners if the video element still exists
      const video = videoRef.current;
      if (video) {
        video.removeEventListener('play', () => {});
        video.removeEventListener('pause', () => {});
        video.removeEventListener('ended', () => {});
      }
    };
  }, [videoRef]);

  return color;
}