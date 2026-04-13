export function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-12 py-6 text-center text-xs text-gray-500">
      <p>
        Formulas based on{' '}
        <a href="https://frakinator.streamlit.app" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
          Frakinator
        </a>{' '}
        &amp;{' '}
        <a href="https://kingshotsimulator.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
          Kingshot Simulator
        </a>
        . This tool is not affiliated with the game developers.
      </p>
    </footer>
  );
}
