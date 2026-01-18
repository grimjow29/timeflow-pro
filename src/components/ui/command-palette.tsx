"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Clock,
  FolderKanban,
  Users,
  CheckSquare,
  Play,
  Square,
  Plus,
  Timer,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COMMAND_PALETTE_EVENTS,
  TIMER_EVENTS,
} from "@/hooks/useKeyboardShortcuts";

interface CommandPaletteProps {
  className?: string;
}

export function CommandPalette({ className }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Listen for command palette events
  useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    window.addEventListener(COMMAND_PALETTE_EVENTS.TOGGLE, handleToggle);
    window.addEventListener(COMMAND_PALETTE_EVENTS.OPEN, handleOpen);
    window.addEventListener(COMMAND_PALETTE_EVENTS.CLOSE, handleClose);

    return () => {
      window.removeEventListener(COMMAND_PALETTE_EVENTS.TOGGLE, handleToggle);
      window.removeEventListener(COMMAND_PALETTE_EVENTS.OPEN, handleOpen);
      window.removeEventListener(COMMAND_PALETTE_EVENTS.CLOSE, handleClose);
    };
  }, []);

  // Handle keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigate = useCallback(
    (path: string) => {
      runCommand(() => router.push(path));
    },
    [router, runCommand]
  );

  const dispatchTimerEvent = useCallback(
    (event: string) => {
      runCommand(() => window.dispatchEvent(new CustomEvent(event)));
    },
    [runCommand]
  );

  const addQuickTime = useCallback(
    (minutes: number) => {
      runCommand(() => {
        router.push(`/dashboard/timesheet?action=quick&duration=${minutes}`);
      });
    },
    [router, runCommand]
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className={cn(
        "fixed inset-0 z-50",
        className
      )}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog Content */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <div
          className={cn(
            "overflow-hidden rounded-xl",
            "bg-surface/95 backdrop-blur-xl",
            "border border-white/10",
            "shadow-glass shadow-2xl",
            "animate-fade-in"
          )}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-white/10">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <Command.Input
              placeholder="Search commands..."
              className={cn(
                "flex-1 h-12 bg-transparent",
                "text-white placeholder:text-slate-500",
                "outline-none border-none",
                "text-sm"
              )}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-slate-500 bg-white/5 rounded border border-white/10">
              ESC
            </kbd>
          </div>

          {/* Command List */}
          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            {/* Navigation Group */}
            <Command.Group
              heading="Navigation"
              className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5"
            >
              <CommandItem
                onSelect={() => navigate("/dashboard")}
                icon={<LayoutDashboard className="h-4 w-4" />}
                shortcut="G D"
              >
                Dashboard
              </CommandItem>
              <CommandItem
                onSelect={() => navigate("/dashboard/timesheet")}
                icon={<Clock className="h-4 w-4" />}
                shortcut="G T"
              >
                Timesheet
              </CommandItem>
              <CommandItem
                onSelect={() => navigate("/dashboard/projects")}
                icon={<FolderKanban className="h-4 w-4" />}
                shortcut="G P"
              >
                Projects
              </CommandItem>
              <CommandItem
                onSelect={() => navigate("/dashboard/team")}
                icon={<Users className="h-4 w-4" />}
                shortcut="G M"
              >
                Team
              </CommandItem>
              <CommandItem
                onSelect={() => navigate("/dashboard/approvals")}
                icon={<CheckSquare className="h-4 w-4" />}
                shortcut="G A"
              >
                Approvals
              </CommandItem>
            </Command.Group>

            {/* Actions Group */}
            <Command.Group
              heading="Actions"
              className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5 mt-2"
            >
              <CommandItem
                onSelect={() => dispatchTimerEvent(TIMER_EVENTS.START)}
                icon={<Play className="h-4 w-4 text-emerald-400" />}
                shortcut="Ctrl+T"
              >
                Start Timer
              </CommandItem>
              <CommandItem
                onSelect={() => dispatchTimerEvent(TIMER_EVENTS.STOP)}
                icon={<Square className="h-4 w-4 text-red-400" />}
              >
                Stop Timer
              </CommandItem>
              <CommandItem
                onSelect={() => navigate("/dashboard/timesheet?action=new")}
                icon={<Plus className="h-4 w-4 text-primary-400" />}
                shortcut="Ctrl+N"
              >
                Add Time Entry
              </CommandItem>
            </Command.Group>

            {/* Quick Add Group */}
            <Command.Group
              heading="Quick Add"
              className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5 mt-2"
            >
              <CommandItem
                onSelect={() => addQuickTime(15)}
                icon={<Timer className="h-4 w-4 text-blue-400" />}
              >
                +15 minutes
              </CommandItem>
              <CommandItem
                onSelect={() => addQuickTime(30)}
                icon={<Timer className="h-4 w-4 text-blue-400" />}
              >
                +30 minutes
              </CommandItem>
              <CommandItem
                onSelect={() => addQuickTime(60)}
                icon={<Timer className="h-4 w-4 text-blue-400" />}
              >
                +1 hour
              </CommandItem>
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono">
                  Enter
                </kbd>
                <span>to select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono">
                  Esc
                </kbd>
                <span>to close</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono">
                Cmd
              </kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-mono">
                K
              </kbd>
            </span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}

// Individual command item component
interface CommandItemProps {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
}

function CommandItem({ children, onSelect, icon, shortcut }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
        "text-sm text-slate-300",
        "data-[selected=true]:bg-primary-500/20 data-[selected=true]:text-white",
        "transition-colors duration-150"
      )}
    >
      {icon && <span className="text-slate-400">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <kbd className="text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}

export default CommandPalette;
