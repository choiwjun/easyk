import Image from 'next/image';
import React from 'react';

interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  className?: string;
}

export default function NextImage({
  src,
  alt,
  width = 400,
  height = 300,
  priority = false,
  fill = false,
  className = '',
}: NextImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      fill={fill}
      className={className}
      // 외부 이미지 허용
      unoptimized={false}
    />
  );
}





