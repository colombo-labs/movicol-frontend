import { HeroUIProvider } from '@heroui/react';
import ReactDOM from 'react-dom/client';

import { App } from './app/App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HeroUIProvider>
    <App />
  </HeroUIProvider>,
);
