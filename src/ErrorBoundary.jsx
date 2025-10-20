import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#f33', background: '#111', minHeight: '100vh' }}>
          <h2>Something went wrong rendering the app</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fff' }}>
            {String(this.state.error && this.state.error.toString())}
          </pre>
          <details style={{ color: '#ddd' }}>
            {this.state.info && this.state.info.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
