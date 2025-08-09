import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { initMonitoring, sendWebVitalToGA } from './monitoring'
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals'

initMonitoring();

createRoot(document.getElementById("root")!).render(<App />);

onCLS(sendWebVitalToGA);
onFID(sendWebVitalToGA);
onLCP(sendWebVitalToGA);
onINP(sendWebVitalToGA);
onTTFB(sendWebVitalToGA);
