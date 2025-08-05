import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Skeleton className="w-full h-48" />
        <Skeleton className="absolute top-2 left-2 h-6 w-20" />
      </div>
      
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <Skeleton className="h-8 w-24" />
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
};