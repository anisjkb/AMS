//E:\Audit\AMS\frontend\src\contexts\NavigationContext.tsx

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

export const NAVIGATION_CACHE_KEY = "ams_navigation_cache";

let navigationRequestPromise: Promise<NavigationGroup[]> | null = null;

const readNavigationCache = (): NavigationGroup[] | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cachedNavigation = sessionStorage.getItem(NAVIGATION_CACHE_KEY);

    if (!cachedNavigation) {
      return null;
    }

    const parsedNavigation = JSON.parse(cachedNavigation);

    if (!Array.isArray(parsedNavigation)) {
      return null;
    }

    return parsedNavigation as NavigationGroup[];
  } catch {
    return null;
  }
};

const writeNavigationCache = (navigation: NavigationGroup[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(NAVIGATION_CACHE_KEY, JSON.stringify(navigation));
  } catch {
    // Ignore storage errors.
  }
};

export const clearNavigationCache = () => {
  navigationRequestPromise = null;

  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(NAVIGATION_CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
};

const fetchNavigationOnce = (forceRefresh = false) => {
  if (!forceRefresh && navigationRequestPromise) {
    return navigationRequestPromise;
  }

  navigationRequestPromise = getMyNavigation()
    .then((data) => {
      writeNavigationCache(data);
      return data;
    })
    .finally(() => {
      navigationRequestPromise = null;
    });

  return navigationRequestPromise;
};

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadNavigation = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchNavigationOnce(true);
      setNavigation(data);
    } catch (error) {
      console.error("Failed to load AMS navigation:", error);
      clearNavigationCache();
      setNavigation([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const request = Promise.resolve().then(async () => {
      const cachedNavigation = readNavigationCache();

      if (cachedNavigation) {
        return cachedNavigation;
      }

      return fetchNavigationOnce(false);
    });

    void request
      .then((data) => {
        if (cancelled) return;

        setNavigation(data);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Failed to load AMS navigation:", error);
        clearNavigationCache();
        setNavigation([]);
      })
      .finally(() => {
        if (cancelled) return;

        setLoading(false);
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