export type NavigationAction = {
  id: number;
  action_key: string;
  action_title: string;
  permission_key: string;
  button_color: string | null;
  button_icon: string | null;
  sort_order: number;
};

export type NavigationMenu = {
  id: number;
  menu_key: string;
  menu_title: string;
  route_path: string | null;
  icon: string | null;
  permission_key: string | null;
  sort_order: number;
  actions: NavigationAction[];
};

export type NavigationGroup = {
  id: number;
  group_key: string;
  group_title: string;
  group_icon: string | null;
  group_badge: string | null;
  group_color: string | null;
  sort_order: number;
  menus: NavigationMenu[];
};