const base = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
};

export const IconCalendar = () => (
    <svg {...base}>
        <rect x="3" y="5" width="18" height="16" rx="1"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
    </svg>
);

export const IconUser = () => (
    <svg {...base}>
        <circle cx="12" cy="8" r="3.2"/>
        <path d="M5 20c0-4 3-6 7-6s7 2 7 6"/>
    </svg>
);

export const IconUsers = () => (
    <svg {...base}>
        <circle cx="9" cy="8" r="2.8"/>
        <path d="M3 20c0-3.2 2.6-5 6-5s6 1.8 6 5"/>
        <circle cx="17.5" cy="9" r="2.2"/>
        <path d="M15 20c0-2.6 1.2-4 3.5-4.4"/>
    </svg>
);

export const IconActivity = () => (
    <svg {...base}>
        <polyline points="3 12 8 12 10 6 14 18 16 12 21 12"/>
    </svg>
);

export const IconFlame = () => (
    <svg {...base}>
        <path
            d="M12 3c1 3-2 4-2 7a3 3 0 0 0 6 0c0-1.5-1-2-1-3.5C17 8 19 10 19 13a7 7 0 1 1-14 0c0-4 3-6 4-8 .5 1 1.5 1.5 3-2z"/>
    </svg>
);

export const IconMapPin = () => (
    <svg {...base}>
        <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/>
        <circle cx="12" cy="9" r="2.3"/>
    </svg>
);

export const IconDroplet = () => (
    <svg {...base}>
        <path d="M12 3c3.5 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.5 6-11z"/>
    </svg>
);

export const IconPulse = () => (
    <svg {...base}>
        <path d="M3 12h4l2 6 4-14 2 8h6"/>
    </svg>
);

export const IconRuler = () => (
    <svg {...base}>
        <rect x="3" y="8" width="18" height="8" rx="1"/>
        <line x1="7" y1="8" x2="7" y2="11"/>
        <line x1="11" y1="8" x2="11" y2="12"/>
        <line x1="15" y1="8" x2="15" y2="11"/>
    </svg>
);

export const IconSyringe = () => (
    <svg {...base}>
        <line x1="4" y1="20" x2="10" y2="14"/>
        <line x1="9" y1="7" x2="17" y2="15"/>
        <line x1="13" y1="3" x2="21" y2="11"/>
        <line x1="6" y1="18" x2="8" y2="16"/>
    </svg>
);

export const IconDna = () => (
    <svg {...base}>
        <path d="M7 3c0 6 10 12 10 18M17 3c0 6-10 12-10 18"/>
        <line x1="8" y1="8" x2="16" y2="8"/>
        <line x1="8" y1="16" x2="16" y2="16"/>
    </svg>
);