import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.js';

interface ChartContainerProps {
  title: string;
  icon?: React.ElementType;
  children: ReactNode;
}

export function ChartContainer({ title, icon: Icon, children }: ChartContainerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
