import { useCallback, useLayoutEffect, useRef, useState } from 'react';

type HorizontalAlign = 'left' | 'center' | 'right';

type AutoScaleTextBoxProps = {
  text: string | number;
  className?: string;
  style?: React.CSSProperties;
  textId?: string;
  textClassName?: string;
  align?: HorizontalAlign;
  textTranslateX?: number;
  textTranslateY?: number;
  maxScale?: number;
  minScale?: number;
};

export function AutoScaleTextBox({
  text,
  className,
  style,
  textId,
  textClassName,
  align = 'center',
  textTranslateX = 0,
  textTranslateY = 0,
  maxScale = 1,
  minScale = 0.5,
}: AutoScaleTextBoxProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    const box = boxRef.current;
    const textNode = textRef.current;
    if (!box || !textNode) return;
    const boxWidth = box.clientWidth;
    const boxHeight = box.clientHeight;
    const textWidth = textNode.scrollWidth;
    const textHeight = textNode.scrollHeight;
    if (!boxWidth || !boxHeight || !textWidth || !textHeight) return;
    const next = Math.min(maxScale, boxWidth / textWidth, boxHeight / textHeight);
    const clamped = Math.max(minScale, next);
    setScale((prev) => (Math.abs(prev - clamped) < 0.01 ? prev : clamped));
  }, [maxScale, minScale]);

  useLayoutEffect(() => {
    updateScale();
    const box = boxRef.current;
    if (!box) return undefined;
    const observer = new ResizeObserver(updateScale);
    observer.observe(box);
    return () => observer.disconnect();
  }, [updateScale]);

  useLayoutEffect(() => {
    updateScale();
  }, [text, updateScale]);

  const justifyContent =
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  const transformOrigin =
    align === 'left' ? 'left center' : align === 'right' ? 'right center' : 'center';
  const translate = `translate(${textTranslateX}px, ${textTranslateY}px)`;

  return (
    <div ref={boxRef} className={className} style={style}>
      <span
        id={textId}
        className={textClassName}
        style={{
          width: '100%',
          height: '100%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent,
          transformOrigin,
          transform: `${translate} scale(${scale})`,
        }}
      >
        <span ref={textRef} className="whitespace-nowrap">
          {text}
        </span>
      </span>
    </div>
  );
}
