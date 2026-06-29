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
  parent_menu_id: number | null;
  menu_key: string;
  menu_title: string;
  route_path: string | null;
  icon: string | null;
  permission_key: string | null;
  sort_order: number;
  menu_level: number;
  is_expandable: boolean;
  actions: NavigationAction[];
  children: NavigationMenu[];
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
