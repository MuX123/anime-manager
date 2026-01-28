/**
 * ACG 收藏庫 - TypeScript 類型定義
 * 提供完整的類型安全和 IntelliSense 支援
 * @version 1.0.0
 * @author ACG Manager Development Team
 */

// ===== 基礎類型定義 =====

/**
 * 作品資料結構
 */
export interface Anime {
  id: string;
  title: string;
  poster_url?: string;
  genre: string[];
  year: string;
  season: string;
  month: string;
  episodes: string;
  rating: string;
  recommendation: string;
  category_colors?: CategoryColors;
  extra_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * 分類顏色配置
 */
export interface CategoryColors {
  genre?: string;
  year?: string;
  month?: string;
  season?: string;
  episodes?: string;
  rating?: string;
  recommendation?: string;
  btn_bg?: string;
  [key: string]: string | undefined;
}

/**
 * 網站設定結構
 */
export interface SiteSettings {
  site_title: string;
  announcement: string;
  title_color: string;
  announcement_color: string;
  admin_name: string;
  admin_avatar: string;
  admin_color: string;
  custom_labels: Record<string, string>;
  [key: string]: any;
}

/**
 * 公告資料結構
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 訪客統計資料結構
 */
export interface VisitorAnalytics {
  id: string;
  visitor_id: string;
  page_url: string;
  timestamp: string;
  user_agent?: string;
  session_data?: Record<string, any>;
}

/**
 * 選項資料結構
 */
export interface OptionsData {
  genre: string[];
  year: string[];
  month: string[];
  season: string[];
  episodes: string[];
  rating: string[];
  recommendation: string[];
  category_colors: CategoryColors;
  custom_lists: CustomList[];
}

/**
 * 自定義列表結構
 */
export interface CustomList {
  id: string;
  name: string;
  items: string[];
  color?: string;
  created_at: string;
}

/**
 * 用戶資料結構
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'user';
  created_at: string;
  last_login?: string;
}

/**
 * 日誌條目結構
 */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  data?: Record<string, any>;
  url: string;
  user_agent: string;
  session_id: string;
  user_id?: string;
}

/**
 * 性能指標結構
 */
export interface PerformanceMetric {
  name: string;
  timestamp: string;
  duration?: number;
  startTime?: number;
  type: 'metric' | 'timer';
  [key: string]: any;
}

// ===== 配置相關類型 =====

/**
 * 應用配置結構
 */
export interface AppConfig {
  supabase: SupabaseConfig;
  security: SecurityConfig;
  app: ApplicationConfig;
}

/**
 * Supabase 配置
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  [key: string]: any;
}

/**
 * 安全配置
 */
export interface SecurityConfig {
  cspEnabled: boolean;
  sessionSecret: string;
  [key: string]: any;
}

/**
 * 應用配置
 */
export interface ApplicationConfig {
  version: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
  [key: string]: any;
}

/**
 * 日誌配置
 */
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStorageSize: number;
  remoteEndpoint?: string;
  [key: string]: any;
}

// ===== 狀態管理類型 =====

/**
 * 應用狀態結構
 */
export interface AppState {
  currentSection: string;
  currentCategory: string;
  currentAdminTab: string;
  isAdmin: boolean;
  currentPage: number;
  adminPage: number;
  gridColumns: number | 'mobile';
  sortOrder: 'asc' | 'desc';
  importTarget: string;
  editId: string | null;
  isFirstLoad: boolean;
  animeData: Anime[];
  optionsData: OptionsData;
  siteSettings: SiteSettings;
  filters: FilterOptions;
}

/**
 * 篩選選項結構
 */
export interface FilterOptions {
  search: string;
  genre: string;
  year: string;
  rating: string;
  season: string;
  month: string;
  [key: string]: string;
}

// ===== UI 相關類型 =====

/**
 * 佈局類型
 */
export type LayoutType = 'grid' | 'list' | 'mobile';

/**
 * 主題類型
 */
export type ThemeType = 'dark' | 'light' | 'auto';

/**
 * 語言類型
 */
export type LanguageType = 'zh-TW' | 'en' | 'ja';

/**
 * Toast 通知類型
 */
export interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  [key: string]: any;
}

/**
 * 模態框配置
 */
export interface ModalConfig {
  title?: string;
  content: string;
  showCloseButton?: boolean;
  backdrop?: boolean;
  size?: 'small' | 'medium' | 'large';
  [key: string]: any;
}

// ===== API 相關類型 =====

/**
 * API 回應結構
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  count?: number;
  status: number;
  statusText: string;
}

/**
 * API 錯誤結構
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
  hint?: string;
}

/**
 * 分頁請求參數
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * 排序參數
 */
export interface SortParams {
  column: string;
  order: 'asc' | 'desc';
}

/**
 * 查詢參數組合
 */
export interface QueryParams extends PaginationParams {
  select?: string;
  filters?: Record<string, any>;
  sort?: SortParams;
}

// ===== 事件相關類型 =====

/**
 * 自定義事件類型
 */
export interface CustomEventDetail<T = any> {
  type: string;
  data: T;
  timestamp: string;
}

/**
 * 拖拽事件數據
 */
export interface DragEventData {
  draggedElement: HTMLElement;
  dropTarget?: HTMLElement;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

/**
 * 鍵盤快捷鍵配置
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

// ===== 組件相關類型 =====

/**
 * 表格列配置
 */
export interface TableColumn {
  key: string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: any) => string | HTMLElement;
}

/**
 * 表單欄位配置
 */
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
  [key: string]: any;
}

/**
 * 菜單項配置
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action?: () => void;
  children?: MenuItem[];
  disabled?: boolean;
  active?: boolean;
}

// ===== 工具類型 =====

/**
 * 深度部分類型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 選擇性排除類型
 */
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * 建構參數類型
 */
export type ConstructorParams<T> = T extends new (...args: infer P) => any ? P : never;

/**
 * 函數回調類型
 */
export type Callback<T = void> = (data: T) => void;

/**
 * 非同步回調類型
 */
export type AsyncCallback<T = void> = (data: T) => Promise<void>;

/**
 * 事件處理器類型
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * 條件類型：從 T 中選擇 U 的屬性
 */
export type PickByType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * 條件類型：從 T 中排除 U 的屬性
 */
export type OmitByType<T, U> = {
  [K in keyof T]: T[K] extends U ? never : K;
}[keyof T];

// ===== 全局類型擴展 =====

/**
 * 全局 window 對象擴展
 */
declare global {
  interface Window {
    // 核心模組
    configManager: ConfigManager;
    securityManager: SecurityManager;
    logger: Logger;
    supabaseManager: SupabaseManager;
    supabaseClient: any;
    
    // 應用狀態
    animeData: Anime[];
    optionsData: OptionsData;
    siteSettings: SiteSettings;
    currentSection: string;
    isAdmin: boolean;
    
    // 工具函數
    showToast: (message: string, type?: string) => void;
    hideLoginModal: () => void;
    handleLogin: () => void;
    loadData: () => Promise<void>;
    renderAdmin: () => void;
    deleteAnime: (id: string) => Promise<void>;
    
    // 自定義配置
    __ACG_CONFIG__?: Record<string, string>;
    currentUser?: User;
  }
}

// ===== 模組導出 =====

export * from './dom-types';
export * from './css-types';
export * from './supabase-types';

// 預設導出
export default {
  // 資料模型
  Anime,
  SiteSettings,
  Announcement,
  VisitorAnalytics,
  
  // 配置
  AppConfig,
  LoggerConfig,
  
  // 工具類型
  DeepPartial,
  OptionalExcept,
  Callback,
  AsyncCallback
};