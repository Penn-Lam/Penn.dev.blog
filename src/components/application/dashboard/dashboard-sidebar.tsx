"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";
import { RiSideBarFill } from "@remixicon/react";
import { Badge } from "@/components/base/badges/badge";
import { cx } from "@/utils/cx";

/**
 * Figma sources:
 *   expanded  → Board UI → dashboard 1 → Sidebar (node 3731:2934)
 *   collapsed → Board UI → Sidebar (node 3768:3382)
 *
 * Floating sidebar panel. Expanded: 260px wide, p 12, radius/3xl (24px),
 * white 1px border, "Background/Sidebar Elevation" shadow, bg
 * background/secondary. Collapsed: 60px wide (36px icon items + 12px
 * padding); the collapse button sits centered at the top, nav items become
 * icon-only squares.
 *
 * The two states morph into each other: the panel width animates while
 * labels / badges collapse via max-width + opacity.
 *
 * Site adaptation of the BoardUI dashboard sidebar template: the template's
 * mock chrome (quick search with a ⌘L binding, Support/Settings rows +
 * settings modal, theme toggle, team plan card, fake user accounts) was
 * removed. `header` and `footer` render props (receiving the collapsed
 * state) replace the workspace user menu and team card slots.
 */

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

/**
 * Collapsible text/badge slot: blurs + fades + shrinks away when the rail
 * closes, and blurs back in on expand. The icons/rows themselves stay pinned in
 * place — only these label/badge slots animate — so nothing jumps to center.
 */
export function Collapsible({
  collapsed,
  children,
  className,
}: {
  collapsed: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,filter] duration-300 ease-in-out",
        // Expanded, the cap is the row itself: a fixed cap (it was 160px)
        // clipped any label wider than it, "Components and Blocks" included.
        collapsed ? "max-w-0 opacity-0 blur-[3px]" : "max-w-full opacity-100 blur-0",
        className,
      )}
    >
      {children}
    </span>
  );
}

function NavItem({
  icon: Icon,
  label,
  badge,
  isSelected = false,
  collapsed = false,
  href,
}: {
  icon: IconComponent;
  label: string;
  badge?: ReactNode;
  isSelected?: boolean;
  collapsed?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-current={isSelected ? "page" : undefined}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={cx(
        "flex items-center justify-between overflow-hidden rounded-2lg p-2",
        "transition-[width,background-color] duration-300 ease-in-out",
        collapsed ? "w-9" : "w-full",
        isSelected
          ? "bg-linear-to-b from-accent-500 to-accent-600 shadow-nav-selected"
          : "hover:bg-background-secondary-hover",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon
          className={cx("size-5 shrink-0", isSelected ? "text-white" : "text-foreground-icon-secondary")}
          aria-hidden
        />
        <Collapsible collapsed={collapsed}>
          <span
            className={cx(
              "text-body-medium whitespace-nowrap",
              isSelected ? "text-white" : "text-text-secondary",
            )}
          >
            {label}
          </span>
        </Collapsible>
      </span>
      {badge && <Collapsible collapsed={collapsed}>{badge}</Collapsible>}
    </Link>
  );
}

/** A primary navigation row. */
export interface SidebarNavItem {
  key: string;
  label: string;
  icon: IconComponent;
  href: string;
  badge?: string | number;
}

/** Kept as a name for callers that typed their `selected` prop; any key works. */
export type SidebarNavKey = string;

export function Sidebar({
  selected,
  items,
  header,
  footer,
  className,
}: {
  /** Which nav item shows the selected (filled blue) state. */
  selected: SidebarNavKey;
  /** Primary navigation rows. */
  items: SidebarNavItem[];
  /** Identity slot at the top; receives the collapsed state so the label can shrink to just the avatar. */
  header?: (collapsed: boolean) => ReactNode;
  /** Slot below the nav (e.g. the vinyl player); receives the collapsed state. */
  footer?: (collapsed: boolean) => ReactNode;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cx(
        "flex h-full shrink-0 flex-col overflow-hidden",
        "rounded-3xl border border-border-button-white bg-background-secondary-default shadow-sidebar",
        "transition-[width] duration-300 ease-in-out",
        // Collapsed rail keeps the 60px spec: 1px border + 11px padding on each
        // side leaves an exactly 36px column so the w-9 (36px) icon items center.
        collapsed ? "w-[60px] px-[11px] py-3" : "w-[260px] p-3",
        className,
      )}
    >
      {/* `overflow-y: auto` forces the x axis to clip too, and this box hugs
          its contents on every side — so the selected item's 1px ring and
          focus rings all landed outside it. Padding moves the clip edge out;
          the matching negative margin borrows that space back from the rail's
          own padding, leaving every child exactly where it was. */}
      <div
        className="-m-2 flex min-h-0 w-[calc(100%+16px)] flex-col gap-2 overflow-y-auto p-2 [scrollbar-width:none]"
      >
        {/* Identity / collapse control */}
        <div
          className={cx(
            "flex w-full transition-[gap] duration-300 ease-in-out",
            collapsed
              ? "flex-col-reverse items-start justify-center gap-2.5"
              : "flex-row items-center justify-between",
          )}
        >
          {/* The clip hides the label as `max-width` animates shut. */}
          <div
            className={cx(
              "-m-2 min-w-0 overflow-hidden p-2 transition-[max-width,opacity,transform] duration-300 ease-in-out",
              collapsed ? "max-w-none scale-95 opacity-100" : "max-w-[206px] scale-100 opacity-100",
            )}
          >
            {header?.(collapsed)}
          </div>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
            className={cx(
              "cursor-pointer text-foreground-icon-secondary transition-transform duration-300 ease-in-out",
              collapsed && "flex w-9 items-center justify-center",
            )}
          >
            <RiSideBarFill
              className={cx("size-5 transition-transform duration-300 ease-in-out", !collapsed && "-scale-x-100")}
              aria-hidden
            />
          </button>
        </div>

        {/* Primary nav. The 2px inset is for the expanded rail only: the
            collapsed column is exactly as wide as a 36px item, so padding
            here pushes every item 2px right and the rail's own clip shaves
            that much off its selected fill and hover state. */}
        <nav className={cx("flex w-full flex-col gap-1", !collapsed && "px-0.5")}>
          {items.map((item) => {
            const isSelected = selected === item.key;
            return (
              <NavItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isSelected={isSelected}
                collapsed={collapsed}
                badge={
                  item.badge !== undefined ? (
                    <Badge color={isSelected ? "primary" : "neutral"}>{item.badge}</Badge>
                  ) : undefined
                }
              />
            );
          })}
        </nav>

        {footer?.(collapsed)}
      </div>
    </aside>
  );
}
