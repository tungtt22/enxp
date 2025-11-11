import React from 'react';
import { BasePlugin, PluginContext } from '@enxp/core';

/**
 * Frontend-specific plugin capabilities
 */
export interface IFrontendPlugin {
  /** Register React components */
  registerComponents?(): Map<string, React.ComponentType<any>>;
  
  /** Register routes */
  registerRoutes?(): RouteDefinition[];
  
  /** Register menu items */
  registerMenuItems?(): MenuItem[];
  
  /** Register widgets */
  registerWidgets?(): Widget[];
  
  /** Register themes */
  registerThemes?(): ThemeDefinition[];
  
  /** Register hooks */
  registerHooks?(): Map<string, Function>;
}

/**
 * Route definition
 */
export interface RouteDefinition {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  meta?: {
    title?: string;
    icon?: string;
    protected?: boolean;
  };
}

/**
 * Menu item definition
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  order?: number;
}

/**
 * Widget definition
 */
export interface Widget {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
  size?: {
    width: number;
    height: number;
  };
}

/**
 * Theme definition
 */
export interface ThemeDefinition {
  id: string;
  name: string;
  colors: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, string>;
}

/**
 * Base class for frontend plugins
 */
export abstract class FrontendPlugin extends BasePlugin implements IFrontendPlugin {
  constructor(
    id: string,
    name: string,
    version: string,
    options?: {
      description?: string;
      dependencies?: string[];
    }
  ) {
    super(id, name, version, 'frontend', options);
  }

  /**
   * Override to register React components
   */
  registerComponents?(): Map<string, React.ComponentType<any>>;

  /**
   * Override to register routes
   */
  registerRoutes?(): RouteDefinition[];

  /**
   * Override to register menu items
   */
  registerMenuItems?(): MenuItem[];

  /**
   * Override to register widgets
   */
  registerWidgets?(): Widget[];

  /**
   * Override to register themes
   */
  registerThemes?(): ThemeDefinition[];

  /**
   * Override to register hooks
   */
  registerHooks?(): Map<string, Function>;

  protected async onActivate(): Promise<void> {
    // Frontend components are registered but not auto-loaded
    // The frontend app will query for them
    await super.onActivate();
  }
}

/**
 * Plugin context for React components
 */
export interface PluginComponentProps {
  pluginContext: PluginContext;
  [key: string]: any;
}
