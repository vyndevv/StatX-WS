import { Component } from 'react';

// Filet de sécurité React : une erreur de rendu ou d'effet ne doit pas vider
// la page. Sans boundary, React démonte l'arbre entier et #root reste vide.
class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('[StatX] Erreur de rendu :', error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="boot-error" role="alert">
        <p>Une erreur est survenue pendant le chargement du site.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Recharger la page
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
