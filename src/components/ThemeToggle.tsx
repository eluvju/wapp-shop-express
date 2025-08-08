import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              aria-label="Alternar tema"
              title="Alternar tema"
              className="relative grid place-items-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-current opacity-95 hover:opacity-100 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-150 active:scale-95 backdrop-blur-sm [&>svg]:size-5 [&>svg]:stroke-[2]"
            >
              <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </div>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>Tema</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="bg-background text-foreground border-0 shadow-medium"
      >
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};