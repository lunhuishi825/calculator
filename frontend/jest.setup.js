// 添加Jest DOM断言
import "@testing-library/jest-dom";

// 设置测试环境变量
process.env.NODE_ENV = "test";

// 模拟全局对象
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 抑制测试运行时不必要的控制台输出
beforeAll(() => {
  // 保存原始的控制台方法
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // 替换控制台方法
  console.error = (...args) => {
    // 过滤掉特定的错误消息
    if (
      args[0]?.includes?.("计算请求失败:") ||
      args[0]?.includes?.("Testing Library")
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    // 过滤掉特定的警告消息
    if (args[0]?.includes?.("Warning:")) {
      return;
    }
    originalConsoleWarn(...args);
  };
});
