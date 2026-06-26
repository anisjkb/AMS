"use client";

import { useMemo } from "react";
import { useNavigation } from "@/contexts/NavigationContext";

export function useModuleActions(moduleKey: string) {
  const { hasAction } = useNavigation();

  return useMemo(() => {
    const canView = hasAction(moduleKey, "view");
    const canCreate = hasAction(moduleKey, "create");
    const canUpdate = hasAction(moduleKey, "update");
    const canInactive = hasAction(moduleKey, "inactive");
    const canRestore = hasAction(moduleKey, "restore");
    const canDelete = hasAction(moduleKey, "delete");
    const canPermanentDelete = hasAction(moduleKey, "permanent_delete");
    const canExport = hasAction(moduleKey, "export");
    const canImport = hasAction(moduleKey, "import");

    const showTopActions = canCreate || canExport || canImport;

    const showRowActions =
      canUpdate ||
      canInactive ||
      canRestore ||
      canDelete ||
      canPermanentDelete;

    return {
      canView,
      canCreate,
      canUpdate,
      canInactive,
      canRestore,
      canDelete,
      canPermanentDelete,
      canExport,
      canImport,
      showTopActions,
      showRowActions,
    };
  }, [hasAction, moduleKey]);
}
