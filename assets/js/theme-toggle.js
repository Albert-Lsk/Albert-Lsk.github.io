// 🌓 优化版主题切换系统 - 基于Google Docsy最佳实践
// ================================================

/**
 * 轻量级主题管理器 - 灵感来自Google Docsy
 * 特点：简洁、高性能、无障碍友好
 */
(function() {
  'use strict';
  
  // 🎯 配置常量
  const THEME_CONFIG = {
    storageKey: 'theme-preference',
    attribute: 'data-theme',
    themes: {
      LIGHT: 'light',
      DARK: 'dark'
    },
    defaultTheme: 'light',
    autoSwitchHours: {
      lightStart: 6,
      lightEnd: 18
    }
  };

  /**
   * 核心主题管理类
   */
  class ThemeManager {
    constructor() {
      this.currentTheme = null;
      this.toggleButton = null;
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      this.init();
    }

    /**
     * 初始化主题系统
     */
    init() {
      // 1. 立即设置主题（避免FOUC）
      this.setInitialTheme();
      
      // 2. DOM加载完成后设置UI
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupUI());
      } else {
        this.setupUI();
      }
      
      // 3. 监听系统主题变化
      this.mediaQuery.addEventListener('change', (e) => this.handleSystemThemeChange(e));
    }

    /**
     * 设置初始主题（避免闪烁）
     */
    setInitialTheme() {
      const savedTheme = this.getSavedTheme();
      const systemTheme = this.getSystemTheme();
      const timeBasedTheme = this.getTimeBasedTheme();
      
      // 优先级：保存的主题 > 系统主题 > 时间主题 > 默认主题
      this.currentTheme = savedTheme || systemTheme || timeBasedTheme || THEME_CONFIG.defaultTheme;
      this.applyTheme(this.currentTheme);
    }

    /**
     * 设置UI元素
     */
    setupUI() {
      this.createToggleButton();
      this.setupKeyboardShortcuts();
      this.updateToggleButton();
      
      // 显示欢迎提示（仅首次访问）
      if (!localStorage.getItem('theme-welcome-shown')) {
        setTimeout(() => this.showWelcome(), 1500);
        localStorage.setItem('theme-welcome-shown', 'true');
      }
    }

    /**
     * 创建切换按钮
     */
    createToggleButton() {
      // 检查是否已存在按钮
      if (document.querySelector('.theme-toggle-btn')) return;

      const button = document.createElement('button');
      button.className = 'theme-toggle-btn';
      button.setAttribute('aria-label', '切换明暗主题');
      button.setAttribute('title', '切换明暗主题 (Ctrl+Shift+T)');
      button.innerHTML = `
        <svg class="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg class="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `;

      // 添加样式
      this.injectToggleStyles();
      
      // 绑定事件
      button.addEventListener('click', () => this.toggleTheme());
      
      // 添加到页面
      document.body.appendChild(button);
      this.toggleButton = button;
    }

    /**
     * 注入切换按钮样式
     */
    injectToggleStyles() {
      if (document.querySelector('#theme-toggle-styles')) return;

      const styles = document.createElement('style');
      styles.id = 'theme-toggle-styles';
      styles.textContent = `
        .theme-toggle-btn {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1000;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          border: 2px solid var(--border-primary, #e2e8f0);
          background: var(--bg-card, rgba(255, 255, 255, 0.9));
          backdrop-filter: blur(12px);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px var(--shadow-primary, rgba(0, 0, 0, 0.1));
        }
        
        .theme-toggle-btn:hover {
          transform: scale(1.1);
          border-color: var(--accent-primary, #0ea5e9);
          box-shadow: 0 8px 30px var(--shadow-glow, rgba(14, 165, 233, 0.2));
        }
        
        .theme-toggle-btn:focus {
          outline: 2px solid var(--accent-primary, #0ea5e9);
          outline-offset: 2px;
        }
        
        .theme-icon {
          color: var(--accent-primary, #0ea5e9);
          transition: all 0.3s ease;
        }
        
        .theme-toggle-btn:hover .theme-icon {
          transform: rotate(15deg);
        }
        
        [data-theme="light"] .sun-icon {
          display: none;
        }
        
        [data-theme="dark"] .moon-icon {
          display: none;
        }
        
        @media (max-width: 768px) {
          .theme-toggle-btn {
            top: 0.75rem;
            right: 0.75rem;
            width: 2.75rem;
            height: 2.75rem;
          }
        }
      `;
      
      document.head.appendChild(styles);
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+T 或 Cmd+Shift+T
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    }

    /**
     * 切换主题
     */
    toggleTheme() {
      const newTheme = this.currentTheme === THEME_CONFIG.themes.LIGHT 
        ? THEME_CONFIG.themes.DARK 
        : THEME_CONFIG.themes.LIGHT;
      
      this.setTheme(newTheme, true);
      
      // 添加切换动画
      this.animateToggle();
    }

    /**
     * 设置主题
     */
    setTheme(theme, saveToStorage = false) {
      this.currentTheme = theme;
      this.applyTheme(theme);
      
      if (saveToStorage) {
        this.saveTheme(theme);
      }
      
      this.updateToggleButton();
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme, timestamp: Date.now() }
      }));
    }

    /**
     * 应用主题到DOM
     */
    applyTheme(theme) {
      document.documentElement.setAttribute(THEME_CONFIG.attribute, theme);
    }

    /**
     * 更新切换按钮状态
     */
    updateToggleButton() {
      if (!this.toggleButton) return;
      
      const isDark = this.currentTheme === THEME_CONFIG.themes.DARK;
      const label = isDark ? '切换到浅色主题' : '切换到深色主题';
      
      this.toggleButton.setAttribute('aria-label', label);
      this.toggleButton.setAttribute('title', `${label} (Ctrl+Shift+T)`);
    }

    /**
     * 切换动画效果
     */
    animateToggle() {
      if (!this.toggleButton) return;
      
      this.toggleButton.style.transform = 'scale(0.85)';
      setTimeout(() => {
        this.toggleButton.style.transform = 'scale(1)';
      }, 150);
    }

    /**
     * 获取保存的主题
     */
    getSavedTheme() {
      return localStorage.getItem(THEME_CONFIG.storageKey);
    }

    /**
     * 保存主题
     */
    saveTheme(theme) {
      localStorage.setItem(THEME_CONFIG.storageKey, theme);
      localStorage.setItem('theme-last-manual-change', Date.now().toString());
    }

    /**
     * 获取系统主题偏好
     */
    getSystemTheme() {
      return this.mediaQuery.matches ? THEME_CONFIG.themes.DARK : THEME_CONFIG.themes.LIGHT;
    }

    /**
     * 基于时间获取建议主题
     */
    getTimeBasedTheme() {
      const hour = new Date().getHours();
      const { lightStart, lightEnd } = THEME_CONFIG.autoSwitchHours;
      
      return (hour >= lightStart && hour < lightEnd) 
        ? THEME_CONFIG.themes.LIGHT 
        : THEME_CONFIG.themes.DARK;
    }

    /**
     * 处理系统主题变化
     */
    handleSystemThemeChange(e) {
      // 只有在用户没有手动设置主题时才跟随系统
      if (!this.getSavedTheme()) {
        const systemTheme = e.matches ? THEME_CONFIG.themes.DARK : THEME_CONFIG.themes.LIGHT;
        this.setTheme(systemTheme);
      }
    }

    /**
     * 显示欢迎信息
     */
    showWelcome() {
      const welcome = document.createElement('div');
      welcome.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--bg-card, white);
          border: 2px solid var(--accent-primary, #0ea5e9);
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 350px;
          text-align: center;
          box-shadow: 0 20px 40px var(--shadow-primary, rgba(0, 0, 0, 0.1));
          z-index: 10000;
          animation: fadeInScale 0.4s ease;
        ">
          <style>
            @keyframes fadeInScale {
              from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
              to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
          </style>
          <h3 style="color: var(--accent-primary, #0ea5e9); margin: 0 0 1rem 0; font-size: 1.2rem;">
            🌓 智能主题系统
          </h3>
          <p style="color: var(--text-secondary, #666); margin: 0 0 1.5rem 0; line-height: 1.5; font-size: 0.9rem;">
            支持明暗模式切换！点击右上角按钮或使用 <strong>Ctrl+Shift+T</strong> 快捷键。
          </p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: var(--gradient-primary, linear-gradient(135deg, #0ea5e9, #8b5cf6));
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: transform 0.2s;
          " 
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'">
            知道了
          </button>
        </div>
      `;
      
      document.body.appendChild(welcome);
      
      // 3秒后自动消失
      setTimeout(() => {
        if (document.body.contains(welcome)) {
          welcome.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(welcome)) {
              document.body.removeChild(welcome);
            }
          }, 300);
        }
      }, 3000);
    }

    /**
     * 获取当前主题信息
     */
    getThemeInfo() {
      return {
        current: this.currentTheme,
        system: this.getSystemTheme(),
        timeBased: this.getTimeBasedTheme(),
        saved: this.getSavedTheme()
      };
    }
  }

  // 🚀 立即初始化主题管理器
  window.themeManager = new ThemeManager();
  
  // 🎯 暴露全局API（用于调试和扩展）
  window.switchTheme = (theme) => {
    if (window.themeManager && (theme === 'light' || theme === 'dark')) {
      window.themeManager.setTheme(theme, true);
    }
  };
  
  window.getThemeInfo = () => {
    return window.themeManager ? window.themeManager.getThemeInfo() : null;
  };
  
  console.log('🎨 优化版主题系统已启动！');
})();
