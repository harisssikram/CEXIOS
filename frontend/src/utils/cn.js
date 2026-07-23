/**
 * Tiny classnames combinator. Falsy values are skipped, so you can write:
 *   cn("base-class", isActive && "active-class", error && "border-danger")
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
