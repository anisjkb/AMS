"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getMyNavigation } from "@/services/navigation";
import type {
  NavigationAction,
  NavigationGroup,
  NavigationMenu,
} from "@/types/navigation";

type NavigationContextValue = {
  navigation: NavigationGroup[];
  loading: boolean;
  getMenuByKey: (menuKey: string) => NavigationMenu | undefined;
  getActionsByMenuKey: (menuKey: string) => NavigationAction[];
  hasAction: (menuKey: string, actionKey: string) => boolean;
  reloadNavigation: () => Promise<void>;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadNavigation = useCallback(async () => {
    try {
      const data = await getMyNavigation();
      setNavigation(data);
    } catch (error) {
      console.error("Failed to load AMS navigation:", error);
      setNavigation([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    getMyNavigation()
      .then((data) => {
        if (!cancelled) {
          setNavigation(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load AMS navigation:", error);
          setNavigation([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<NavigationContextValue>(() => {
    const allMenus = navigation.flatMap((group) => group.menus);

    const getMenuByKey = (menuKey: string) => {
      return allMenus.find((menu) => menu.menu_key === menuKey);
    };

    const getActionsByMenuKey = (menuKey: string) => {
      return getMenuByKey(menuKey)?.actions ?? [];
    };

    const hasAction = (menuKey: string, actionKey: string) => {
      return getActionsByMenuKey(menuKey).some(
        (action) => action.action_key === actionKey
      );
    };

    return {
      navigation,
      loading,
      getMenuByKey,
      getActionsByMenuKey,
      hasAction,
      reloadNavigation,
    };
  }, [navigation, loading, reloadNavigation]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used inside NavigationProvider");
  }

  return context;
}