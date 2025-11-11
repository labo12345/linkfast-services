import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Created with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>by</span>
            <span className="font-semibold text-foreground">Laban Panda Khisa</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} QuickLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
