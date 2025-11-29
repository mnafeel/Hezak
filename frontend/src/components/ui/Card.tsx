import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useThemeColors } from '../../hooks/useThemeColors';

interface CardProps {
  className?: string;
  title?: ReactNode;
  actions?: ReactNode;
}

const Card = ({ className, title, actions, children }: PropsWithChildren<CardProps>) => {
  const { getGlassPanelClass, getTextColor } = useThemeColors();
  
  return (
    <div className={cn(`${getGlassPanelClass()} p-6 shadow-lg`, className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h3 className={`text-lg font-semibold ${getTextColor('primary')}`}>{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

