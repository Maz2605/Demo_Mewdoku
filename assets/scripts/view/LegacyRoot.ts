/** Retire old render trees before mounting a new root; retain the screen camera of a Canvas host. */
export function retireLegacyChildren<T extends {active: boolean}>(children: readonly T[], screenCamera?: T | null): void {
    for (const child of children) if (child !== screenCamera) child.active = false;
}
