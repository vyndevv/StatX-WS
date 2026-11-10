import { useEffect, useState } from 'react';
import Plasma from './components/Plasma';
import InfiniteSpiral from './components/InfiniteSpiral';
import MagicBento from './components/MagicBento';
import logo from './assets/logo.png';
import './App.css';

const RELEASES_API = 'https://api.github.com/repos/vyndevv/StatX-releases/releases/latest';

// Lance directement le téléchargement de l'installeur de la dernière release.
// Repli sur la page des releases si l'API GitHub ne répond pas.
const startDownload = event => {
  const releasesPage = event.currentTarget.getAttribute('href');
  event.preventDefault();

  fetch(RELEASES_API, { headers: { Accept: 'application/vnd.github+json' } })
    .then(response => (response.ok ? response.json() : Promise.reject(new Error('lookup failed'))))
    .then(release => {
      const asset = (release.assets || []).find(file => /\.exe$/i.test(file.name));
      if (!asset) throw new Error('no installer found');
      window.location.href = asset.browser_download_url;
    })
    .catch(() => {
      window.location.href = releasesPage;
    });
};

const REPO_API = 'https://api.github.com/repos/vyndevv/StatX-releases';
const REPO_URL = 'https://github.com/vyndevv/StatX-releases';

const StarButton = () => {
  const [stars, setStars] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(REPO_API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('lookup failed'))))
      .then(repo => {
        if (!cancelled) setStars(repo.stargazers_count);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <a
      className="btn-star"
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Mettre une étoile à StatX sur GitHub"
    >
      <span className="btn-star-inner">
        <svg className="btn-star-mark" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
          />
        </svg>
        <span className="btn-star-label">Star</span>
        <svg className="btn-star-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            fill="currentColor"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
          />
        </svg>
        {stars !== null && <span className="btn-star-count">{stars}</span>}
      </span>
    </a>
  );
};

const NAV_LINKS = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'surveillance', label: 'En direct' },
  { id: 'actualite', label: 'Actualité' },
];

// Compteur de téléchargements et version, lus sur la dernière release GitHub.
// Le bloc reste invisible si l'API ne répond pas.
const INSTALLER_RE = /\.(exe|msi|dmg|pkg|appimage|deb)$/i;
const MIN_DOWNLOADS = 10;

const DownloadProof = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(RELEASES_API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('lookup failed'))))
      .then(release => {
        if (cancelled) return;
        const downloads = (release.assets || [])
          .filter(asset => INSTALLER_RE.test(asset.name))
          .reduce((total, asset) => total + (asset.download_count || 0), 0);
        setInfo({ version: release.tag_name, downloads });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!info) return null;

  return (
    <p className="hero-proof">
      {info.downloads >= MIN_DOWNLOADS ? (
        <>
          <strong>{new Intl.NumberFormat('fr-FR').format(info.downloads)}</strong>
          téléchargements
          <span className="hero-proof-sep" aria-hidden="true" />
        </>
      ) : (
        <>
          <span className="hero-proof-new">Nouveau</span>
          <span className="hero-proof-sep" aria-hidden="true" />
        </>
      )}
      <span>Version {info.version}</span>
      <span className="hero-proof-sep" aria-hidden="true" />
      <span>Windows 10 &amp; 11</span>
    </p>
  );
};

const FOOTER_COLUMNS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '#surveillance' },
      { label: 'Actualité', href: '#actualite' },
      { label: 'Télécharger', href: `${REPO_URL}/releases`, download: true },
    ],
  },
  {
    title: 'Communauté',
    links: [
      { label: 'Dépôt GitHub', href: REPO_URL },
      { label: 'Journal des versions', href: `${REPO_URL}/releases` },
      { label: 'Signaler un bug', href: `${REPO_URL}/issues` },
    ],
  },
];

const SpiralIcon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    width="21"
    height="21"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const spiralRgba = (hex, alpha) => {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

const SPIRAL_META = {
  cpu: {
    accent: '#4ea1ff',
    value: '34 %',
    points: '0,18 10,15 20,17 30,11 40,14 50,8 60,11 70,6 80,9 90,5 100,7',
  },
  ram: {
    accent: '#34d399',
    value: '13,1 Go',
    points: '0,14 10,16 20,12 30,13 40,10 50,11 60,8 70,9 80,7 90,8 100,6',
  },
  gpu: {
    accent: '#a78bfa',
    value: '27 %',
    points: '0,17 10,19 20,15 30,18 40,13 50,16 60,11 70,14 80,10 90,12 100,9',
  },
  disks: {
    accent: '#94a3b8',
    value: '68 %',
    points: '0,12 10,13 20,12 30,14 40,13 50,12 60,13 70,12 80,14 90,13 100,13',
  },
  network: {
    accent: '#22d3ee',
    value: '94 Mb/s',
    points: '0,20 10,16 20,19 30,12 40,15 50,9 60,13 70,7 80,10 90,6 100,8',
  },
  temp: {
    accent: '#fb923c',
    value: '52 °C',
    points: '0,16 10,13 20,15 30,12 40,14 50,10 60,12 70,9 80,11 90,8 100,10',
  },
  processes: {
    accent: '#a99cff',
    value: 'Top 10',
    points: '0,14 8,10 16,12 24,7 32,9 40,5 48,8 56,6 64,4 72,7 80,3 88,6 96,4 100,5',
  },
  games: {
    accent: '#f472b6',
    value: '144 fps',
    points: '0,18 10,14 20,16 30,9 40,11 50,6 60,8 70,4 80,6 90,3 100,4',
  },
  updates: {
    accent: '#fbbf24',
    value: '2 dispo.',
    points: '0,16 10,16 20,15 30,16 40,14 50,15 60,13 70,14 80,12 90,13 100,11',
  },
  allinone: {
    accent: '#8b7bff',
    value: '1 app',
    points: '0,14 10,12 20,13 30,10 40,11 50,9 60,10 70,8 80,9 90,7 100,8',
  },
  readable: {
    accent: '#7dd3fc',
    value: '0 jargon',
    points: '0,12 10,11 20,12 30,10 40,11 50,9 60,10 70,8 80,9 90,7 100,8',
  },
  windows: {
    accent: '#60a5fa',
    value: '11 · 10',
    points: '0,15 10,13 20,14 30,12 40,13 50,11 60,12 70,10 80,11 90,9 100,10',
  },
};

const SpiralSpark = ({ id, color, points }) => (
  <svg className="spiral-card-spark" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={`spiral-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.42" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <polygon points={`0,24 ${points} 100,24`} fill={`url(#spiral-${id})`} />
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const SpiralCard = ({ id, icon, title, text }) => {
  const meta = SPIRAL_META[id] ?? {};
  const accent = meta.accent ?? '#a99cff';

  return (
    <div
      className="spiral-card"
      style={{
        '--spiral-accent': accent,
        '--spiral-accent-soft': spiralRgba(accent, 0.16),
        '--spiral-accent-line': spiralRgba(accent, 0.42),
      }}
    >
      <span className="spiral-card-ghost" aria-hidden="true">
        {icon}
      </span>
      <div className="spiral-card-top">
        <span className="spiral-card-icon">{icon}</span>
        <span className="spiral-card-value">{meta.value}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {meta.points && <SpiralSpark id={id} color={accent} points={meta.points} />}
    </div>
  );
};

const SPIRAL_ITEMS = [
  {
    id: 'cpu',
    label: 'Processeur',
    content: (
      <SpiralCard
        id="cpu"
        title="Processeur"
        text="Charge par cœur, fréquence et température, en direct."
        icon={
          <SpiralIcon>
            <rect x="6" y="6" width="12" height="12" rx="2" />
            <rect x="10" y="10" width="4" height="4" rx="1" />
            <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'ram',
    label: 'Mémoire vive',
    content: (
      <SpiralCard
        id="ram"
        title="Mémoire vive"
        text="RAM utilisée et processus qui la consomment le plus."
        icon={
          <SpiralIcon>
            <rect x="2" y="6" width="20" height="10" rx="2" />
            <path d="M6 16v3M10 16v3M14 16v3M18 16v3M6 11h12" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'gpu',
    label: 'Carte graphique',
    content: (
      <SpiralCard
        id="gpu"
        title="Carte graphique"
        text="Charge, VRAM et températures de votre GPU."
        icon={
          <SpiralIcon>
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="9" cy="12" r="3" />
            <path d="M15 10h4M15 14h4" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'disks',
    label: 'Disques',
    content: (
      <SpiralCard
        id="disks"
        title="Disques"
        text="Espace libre, débits et santé de chaque SSD ou HDD."
        icon={
          <SpiralIcon>
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M3 14h18M7 17h.01M11 17h.01" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'network',
    label: 'Réseau',
    content: (
      <SpiralCard
        id="network"
        title="Réseau"
        text="Débit montant et descendant, connexions actives."
        icon={
          <SpiralIcon>
            <path d="M4 18h16M7.5 14a6.5 6.5 0 0 1 9 0M10.5 10.5a2.6 2.6 0 0 1 3 0" />
            <circle cx="12" cy="18" r="1" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'temperatures',
    label: 'Températures',
    content: (
      <SpiralCard
        id="temp"
        title="Températures"
        text="Tous les capteurs réunis pour repérer la surchauffe."
        icon={
          <SpiralIcon>
            <path d="M12 3a2.2 2.2 0 0 1 2.2 2.2v7.4a4.2 4.2 0 1 1-4.4 0V5.2A2.2 2.2 0 0 1 12 3Z" />
            <path d="M12 9v5.5" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'processes',
    label: 'Processus',
    content: (
      <SpiralCard
        id="processes"
        title="Processus"
        text="Les plus gourmands, classés par CPU et par RAM."
        icon={
          <SpiralIcon>
            <path d="M4 20v-8M10 20V6M16 20v-5M2 20h20" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'games',
    label: 'Jeux',
    content: (
      <SpiralCard
        id="games"
        title="Jeux"
        text="Voyez ce que vos jeux demandent vraiment à votre PC."
        icon={
          <SpiralIcon>
            <rect x="2" y="7" width="20" height="10" rx="5" />
            <path d="M7 10v4M5 12h4" />
            <circle cx="16.5" cy="11" r=".7" fill="currentColor" stroke="none" />
            <circle cx="18.5" cy="13" r=".7" fill="currentColor" stroke="none" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'updates',
    label: 'Mises à jour',
    content: (
      <SpiralCard
        id="updates"
        title="Mises à jour"
        text="Les mises à jour Windows suivies sans mauvaise surprise."
        icon={
          <SpiralIcon>
            <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
            <path d="M20.5 4v5h-5" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'all-in-one',
    label: 'Tout-en-un',
    content: (
      <SpiralCard
        id="allinone"
        title="Tout-en-un"
        text="Ressources, jeux et mises à jour au même endroit."
        icon={
          <SpiralIcon>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18M9 9v11" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'readable',
    label: 'Lisible',
    content: (
      <SpiralCard
        id="readable"
        title="Lisible"
        text="Des relevés clairs d’un coup d’œil, sans jargon."
        icon={
          <SpiralIcon>
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="2.6" />
          </SpiralIcon>
        }
      />
    ),
  },
  {
    id: 'windows',
    label: 'Windows',
    content: (
      <SpiralCard
        id="windows"
        title="Windows"
        text="Pensé pour Windows, prêt en quelques secondes."
        icon={
          <SpiralIcon>
            <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
            <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
          </SpiralIcon>
        }
      />
    ),
  },
];

const Logo = () => (
  <a className="logo" href="#top">
    <img className="logo-img" src={logo} alt="StatX" width="400" height="216" />
  </a>
);

const PREVIEW_NAV = [
  {
    section: 'Monitoring',
    items: [
      {
        label: 'Performances',
        active: true,
        icon: (
          <>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </>
        ),
      },
      {
        label: 'Processus',
        icon: (
          <>
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
          </>
        ),
      },
      {
        label: 'Réseau',
        icon: (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M4 12h16" />
            <path d="M12 4a13 13 0 0 1 0 16M12 4a13 13 0 0 0 0 16" />
          </>
        ),
      },
    ],
  },
  {
    section: 'Applications',
    items: [
      {
        label: 'Jeux',
        icon: (
          <>
            <rect x="2.5" y="7" width="19" height="10" rx="4.5" />
            <path d="M7.5 10.5v3M6 12h3M15.5 11.5h.01M17.5 13h.01" />
          </>
        ),
      },
      {
        label: 'Logiciels',
        icon: (
          <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </>
        ),
      },
      {
        label: 'Mises à jour',
        icon: (
          <>
            <path d="M12 3v12" />
            <path d="m7 11 5 5 5-5" />
            <path d="M4 21h16" />
          </>
        ),
      },
    ],
  },
  {
    section: 'Système',
    items: [
      {
        label: 'Matériel',
        icon: (
          <>
            <rect x="7" y="7" width="10" height="10" rx="2" />
            <path d="M10 2v3M14 2v3M10 19v3M14 19v3M2 10h3M2 14h3M19 10h3M19 14h3" />
          </>
        ),
      },
      {
        label: 'Santé',
        icon: <path d="M22 12h-4l-3 8-5-16-3 8H2" />,
      },
      {
        label: 'Paramètres',
        icon: (
          <>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
          </>
        ),
      },
    ],
  },
];

const PREVIEW_CORES = [31, 46, 28, 62, 39, 24, 51, 34, 44, 27, 58, 36, 21, 48, 30, 41];

const PREVIEW_PROCS = [
  { name: 'chrome.exe', pid: 8421, cpu: 12.4, mem: 3.2 },
  { name: 'Discord.exe', pid: 6190, cpu: 6.1, mem: 1.8 },
  { name: 'Steam.exe', pid: 5104, cpu: 3.4, mem: 2.6 },
  { name: 'Code.exe', pid: 9277, cpu: 2.9, mem: 1.1 },
  { name: 'explorer.exe', pid: 3988, cpu: 1.2, mem: 0.7 },
];

const PREVIEW_DISKS = [
  { name: 'C: Windows', used: '412 Go', total: '931 Go', pct: 44 },
  { name: 'D: Données', used: '1,32 To', total: '2 To', pct: 66 },
];

const fmtPct = value => `${value.toFixed(1).replace('.', ',')} %`;

const PreviewChart = ({ id, color, points }) => (
  <svg className="pv-chart" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.32" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <polygon points={`0,32 ${points} 100,32`} fill={`url(#${id})`} />
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const DashboardMock = () => (
  <div className="dash" aria-hidden="true">
    <div className="dash-bar">
      <span className="dots">
        <i />
        <i />
        <i />
      </span>
      <span className="dash-title">StatX — Performances</span>
    </div>

    <div className="pv">
      <aside className="pv-side">
        <div className="pv-logo">
          <img src={logo} alt="" width="400" height="216" />
        </div>

        <nav className="pv-nav">
          {PREVIEW_NAV.map(group => (
            <div className="pv-nav-group" key={group.section}>
              <span className="pv-nav-section">{group.section}</span>
              {group.items.map(item => (
                <span className={`pv-nav-item${item.active ? ' is-active' : ''}`} key={item.label}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                  {item.label}
                </span>
              ))}
            </div>
          ))}
        </nav>

        <div className="pv-side-foot">
          <span className="pv-dot" />
          Monitoring actif
        </div>
      </aside>

      <div className="pv-main">
        <div className="pv-topbar">
          <span className="pv-host">DESKTOP-STATX</span>
          <span>AMD Ryzen 7 5800X · 32 Go · Windows 11</span>
        </div>

        <div className="pv-body">
          <div className="pv-head">
            <h3>Performances</h3>
            <p>Toutes les ressources en temps réel</p>
          </div>

          <MagicBento className="pv-grid">
            <article className="pv-card pv-col-4">
              <h2>
                CPU <span className="pv-chip pv-chip-cpu">Processeur</span>
              </h2>
              <div className="pv-value">
                34 <small>%</small>
              </div>
              <div className="pv-sub">4,45 GHz · 8 cœurs / 16 threads</div>
              <PreviewChart id="pv-cpu" color="#4ea1ff" points="0,26 12,23 25,25 37,18 50,21 62,14 75,17 87,9 100,12" />
              <div className="pv-cores">
                {PREVIEW_CORES.map((height, index) => (
                  <span className="pv-core" key={index}>
                    <i style={{ height: `${height}%` }} />
                  </span>
                ))}
              </div>
              <div className="pv-foot">AMD Ryzen 7 5800X 8-Core</div>
            </article>

            <article className="pv-card pv-col-4">
              <h2>
                Mémoire <span className="pv-chip pv-chip-mem">RAM</span>
              </h2>
              <div className="pv-value">
                41 <small>%</small>
              </div>
              <div className="pv-sub">13,1 Go / 32 Go · 3 200 MHz</div>
              <PreviewChart id="pv-mem" color="#34d399" points="0,24 12,25 25,22 37,23 50,19 62,20 75,17 87,18 100,16" />
              <div className="pv-rows">
                <div className="pv-row">
                  <span>Active</span>
                  <b>13,1 Go</b>
                </div>
                <div className="pv-row">
                  <span>Disponible</span>
                  <b>18,9 Go</b>
                </div>
                <div className="pv-row">
                  <span>Swap</span>
                  <b>0,4 Go</b>
                </div>
              </div>
            </article>

            <article className="pv-card pv-col-4">
              <h2>
                Températures <span className="pv-chip pv-chip-temp">CPU</span>
              </h2>
              <div className="pv-value">
                52 <small>°C</small>
              </div>
              <div className="pv-sub">Package · seuil 95 °C</div>
              <PreviewChart id="pv-temp" color="#fb923c" points="0,22 12,20 25,23 37,19 50,21 62,17 75,19 87,16 100,18" />
              <div className="pv-rows">
                <div className="pv-row">
                  <span>GPU</span>
                  <b>61 °C</b>
                </div>
                <div className="pv-row">
                  <span>SSD NVMe</span>
                  <b>38 °C</b>
                </div>
                <div className="pv-row">
                  <span>Ventilateur</span>
                  <b>1 240 tr/min</b>
                </div>
              </div>
            </article>

            <article className="pv-card pv-col-4">
              <h2>
                GPU <span className="pv-chip pv-chip-gpu">Graphique</span>
              </h2>
              <div className="pv-model">NVIDIA GeForce RTX 4070</div>
              <div className="pv-value">
                27 <small>%</small>
              </div>
              <div className="pv-sub">2,7 / 12 Go VRAM · 48 °C</div>
              <span className="pv-bar pv-bar-gpu">
                <i style={{ width: '23%' }} />
              </span>
              <div className="pv-foot">NVIDIA Ada · pilote 566.36</div>
            </article>

            <article className="pv-card pv-col-8">
              <h2>
                Réseau <span className="pv-chip">Temps réel</span>
              </h2>
              <div className="pv-net-row">
                <div className="pv-net-box">
                  <span className="pv-net-label down">▼ Téléchargement</span>
                  <span className="pv-net-value">
                    94,2 <small>Mb/s</small>
                  </span>
                </div>
                <div className="pv-net-box">
                  <span className="pv-net-label up">▲ Envoi</span>
                  <span className="pv-net-value">
                    12,6 <small>Mb/s</small>
                  </span>
                </div>
              </div>
              <svg className="pv-net-chart" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  points="0,27 12,24 25,26 37,20 50,23 62,16 75,19 87,12 100,15"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points="0,30 12,29 25,30 37,28 50,29 62,27 75,28 87,26 100,27"
                  fill="none"
                  stroke="#f472b6"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="pv-net-foot">
                <span>Ethernet · 1 Gb/s</span>
                <span>Réseau domestique</span>
              </div>
            </article>

            <article className="pv-card pv-col-8">
              <h2>
                Processus <span className="pv-chip">Temps réel</span>
              </h2>
              <div className="pv-procs">
                <div className="pv-proc pv-proc-head">
                  <span>#</span>
                  <span>Nom</span>
                  <span>PID</span>
                  <span>CPU</span>
                  <span>RAM</span>
                </div>
                {PREVIEW_PROCS.map((proc, index) => (
                  <div className="pv-proc" key={proc.pid}>
                    <span className="pv-proc-rank">{index + 1}</span>
                    <span className="pv-proc-name">{proc.name}</span>
                    <span className="pv-proc-pid">{proc.pid}</span>
                    <span className="pv-proc-metric">
                      <span>{fmtPct(proc.cpu)}</span>
                      <span className="pv-bar">
                        <i style={{ width: `${Math.round((proc.cpu / 12.4) * 100)}%` }} />
                      </span>
                    </span>
                    <span className="pv-proc-metric">
                      <span>{fmtPct(proc.mem)}</span>
                      <span className="pv-bar">
                        <i style={{ width: `${Math.round((proc.mem / 3.2) * 100)}%` }} />
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="pv-card pv-col-4">
              <h2>
                Disques <span className="pv-chip pv-chip-disk">Stockage</span>
              </h2>
              <div className="pv-disk-top">
                <svg className="pv-donut" viewBox="0 0 80 80">
                  <circle className="pv-donut-track" cx="40" cy="40" r="31" />
                  <circle
                    className="pv-donut-value"
                    cx="40"
                    cy="40"
                    r="31"
                    strokeDasharray="194.8"
                    strokeDashoffset="79.9"
                  />
                  <text className="pv-donut-pct" x="40" y="38">
                    59 %
                  </text>
                  <text className="pv-donut-label" x="40" y="51">
                    utilisé
                  </text>
                </svg>
                <div className="pv-disk-sum">
                  <b>1,71 To</b>
                  <span>sur 2,91 To · 2 volumes</span>
                </div>
              </div>
              <ul className="pv-disk-list">
                {PREVIEW_DISKS.map(disk => (
                  <li key={disk.name}>
                    <div className="pv-disk-row">
                      <b>{disk.name}</b>
                      <span>
                        {disk.used} / {disk.total}
                      </span>
                    </div>
                    <span className="pv-bar">
                      <i style={{ width: `${disk.pct}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </MagicBento>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [activeSection, setActiveSection] = useState('accueil');
  const [showDownloadBar, setShowDownloadBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4;
      let current = NAV_LINKS[0].id;

      NAV_LINKS.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) current = id;
      });
      setActiveSection(current);

      const hero = document.getElementById('accueil');
      const news = document.getElementById('actualite');
      const passedHero = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > 700;
      const newsInView = news ? news.getBoundingClientRect().top < window.innerHeight - 80 : false;
      setShowDownloadBar(passedHero && !newsInView);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
  <>
    <div className="page-bg" aria-hidden="true">
      <Plasma
        color="#2400ff"
        speed={1.15}
        direction="forward"
        scale={1.1}
        twist={2.05}
        wave={1}
        softness={0.32}
        shine={1.1}
        brightness={1.05}
        grain={0.035}
        quality={0.6}
        fade={0.25}
        opacity={0.95}
        mouseInteractive
        intro
      />
      <div className="page-veil" />
    </div>

    <div className="page" id="top">
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className="nav" aria-label="Navigation principale">
          {NAV_LINKS.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={link.id === activeSection ? 'is-active' : undefined}
              aria-current={link.id === activeSection ? 'location' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <StarButton />
          <a
            className="btn btn-github btn-sm"
            href="https://github.com/vyndevv/StatX-releases/releases"
            onClick={startDownload}
            target="_blank"
            rel="noopener noreferrer"
          >
            Télécharger
          </a>
        </div>
      </div>
    </header>

    <section className="hero" id="accueil">
      <div className="hero-veil" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="hero-brand">StatX</span>
          <h1>
            Vos métriques, <em>enfin</em> lisibles.
          </h1>
          <p className="hero-sub">
            StatX surveille en temps réel le CPU, la RAM, le GPU, les disques et le réseau de votre PC.
            Ressources, jeux et mises à jour enfin réunis dans une seule interface.
          </p>
          <div className="hero-actions">
            <a
              className="btn btn-github"
              href="https://github.com/vyndevv/StatX-releases/tree/main"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="btn-github-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                />
              </svg>
              Voir sur GitHub
              <span className="btn-github-arrow" aria-hidden="true">↗</span>
            </a>
            <a
              className="btn btn-ghost"
              href="https://github.com/vyndevv/StatX-releases/releases"
              onClick={startDownload}
              target="_blank"
              rel="noopener noreferrer"
            >
              Télécharger pour Windows
            </a>
          </div>
          <DownloadProof />
        </div>

        <DashboardMock />
      </div>
    </section>

    <section className="section spiral-section" id="surveillance" aria-labelledby="spiral-title">
      <div className="container">
        <div className="spiral-head">
          <span className="spiral-eyebrow">En direct</span>
          <h2 id="spiral-title">Chaque composant, sous surveillance.</h2>
        </div>

        <div className="spiral">
          <InfiniteSpiral
            items={SPIRAL_ITEMS}
            speed={0.5}
            direction="down"
            animationMode="auto"
            radius={300}
            cardWidth={230}
            cardHeight={168}
            verticalSpacing={100}
            perspective={1100}
            cardsPerTurn={6}
            cardRadius={18}
            centerScale={1.14}
            edgeFade={0.38}
            edgeBlur={7}
            pauseOnHover
          />
        </div>
      </div>
    </section>

    <section className="section news-section" id="actualite" aria-labelledby="news-title">
      <div className="container">
        <div className="news-card">
          <div className="news-plasma" aria-hidden="true">
            <Plasma
              color="#3b1cff"
              speed={0.9}
              direction="pingpong"
              scale={1.4}
              twist={2.6}
              softness={0.45}
              shine={0.9}
              brightness={0.85}
              quality={0.5}
              fade={0.8}
              opacity={0.7}
              mouseInteractive={false}
            />
          </div>

          <div className="news-inner">
            <div className="news-meta">
              <span className="news-tag">Actualité</span>
              <span className="news-date">9 novembre 2026</span>
              <span className="news-status">
                <i />
                En développement
              </span>
            </div>

            <h2 className="news-title" id="news-title">
              StatX passe en <em>Rust</em>.
            </h2>

            <p className="news-lead">
              Le moteur de collecte est réécrit de zéro en Rust. Même interface, mêmes relevés — mais un socle
              bien plus léger, pensé pour rester fluide sur n'importe quel PC. Et StatX ne sera plus réservé à
              Windows : la nouvelle version sortira aussi sur <strong>macOS</strong> et <strong>Linux</strong>.
            </p>

            <ul className="news-points">
              <li>
                <b>Plus léger</b>
                <span>Une empreinte mémoire réduite, même avec une douzaine de widgets ouverts.</span>
              </li>
              <li>
                <b>Plus réactif</b>
                <span>Collecte native : les valeurs se rafraîchissent sans à-coups ni pics.</span>
              </li>
              <li>
                <b>Plus stable</b>
                <span>Un cœur unique, moins de dépendances et de plantages silencieux.</span>
              </li>
            </ul>

            <div className="news-actions">
              <a
                className="btn btn-github"
                href="https://github.com/vyndevv/StatX-releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="btn-github-icon" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                  />
                </svg>
                Suivre l'avancement
                <span className="btn-github-arrow" aria-hidden="true">↗</span>
              </a>
              <a
                className="btn btn-quiet"
                href="https://github.com/vyndevv/StatX-releases/releases"
                onClick={startDownload}
                target="_blank"
                rel="noopener noreferrer"
              >
                Télécharger la version actuelle
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>
              Le monitoring de votre PC, sans détour : CPU, RAM, GPU, disques et réseau réunis dans une
              interface qui se lit d'un coup d'œil.
            </p>
            <span className="footer-note">
              <i /> Windows 10 &amp; 11 · 64 bits · Bientôt macOS et Linux
            </span>
          </div>

          {FOOTER_COLUMNS.map(column => (
            <div className="footer-col" key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map(link => {
                  const external = link.href.startsWith('http');
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={link.download ? startDownload : undefined}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} StatX. Tous droits réservés.</span>
          <span>Dernière mise à jour : novembre 2026</span>
        </div>
      </div>
    </footer>

    <div
      className={`mobile-download${showDownloadBar ? ' is-visible' : ''}`}
      aria-hidden={showDownloadBar ? undefined : true}
    >
      <div className="mobile-download-text">
        <b>StatX</b>
        <span>Windows 10 &amp; 11</span>
      </div>
      <a
        className="btn btn-github btn-sm"
        href={`${REPO_URL}/releases`}
        onClick={startDownload}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={showDownloadBar ? 0 : -1}
      >
        Télécharger
      </a>
    </div>
    </div>
  </>
  );
};

export default App;
