import { Component, type ErrorInfo, type ReactNode } from 'react';

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Layout Error:', error, errorInfo);
    // 可以添加错误日志上报逻辑
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">发生错误</h2>
          <p className="text-muted-foreground mb-6">{this.state.error?.message || '未知错误'}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => this.setState({ hasError: false })}
          >
            尝试恢复
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
