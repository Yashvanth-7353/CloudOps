export interface Route {
  path: string;
  name: string;
  component: React.ComponentType<any>;
  protected?: boolean;
  children?: Route[];
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}