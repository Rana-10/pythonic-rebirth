import {useState, useEffect, useRef} from 'react';
import {predictDelay, getAirports, getCarriers, getDistance} from './api';
import './App.css';

function AutocompleteField({label, name, value, options, onChange, placeholder, maxLength}) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    const matches = value.length > 0
        ? options.filter(o => o.startsWith(value.toUpperCase())).slice(0, 6)
        : [];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="field autocomplete-wrap" ref={wrapRef}>
            <label>{label}</label>
            <input
                name={name}
                value={value}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={(e) => {
                    onChange(e);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                autoComplete="off"
                required
            />
            {open && matches.length > 0 && (
                <ul className="autocomplete-list">
                    {matches.map(code => (
                        <li key={code} onMouseDown={() => {
                            onChange({target: {name, value: code}});
                            setOpen(false);
                        }}>
                            {code}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    console.log('LiveClock rendering:', time.toLocaleTimeString());
    return <span>{time.toLocaleTimeString()}</span>;
}

function App() {
    const [airports, setAirports] = useState([]);
    const [carriers, setCarriers] = useState([]);
    const [boardReady, setBoardReady] = useState(false);
    const [formData, setFormData] = useState({
        origin: '', dest: '', carrier: '', distance: '',
        fl_date: '', crs_dep_hour: 10, crs_arr_hour: 13,
        temp: '', rhum: '', prcp: '', wspd: '', pres: '',
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('flightHistory');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    useEffect(() => {
        localStorage.setItem('flightHistory', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        getAirports().then(setAirports).catch(() => {
        });
        getCarriers().then(setCarriers).catch(() => {
        });
        const t = setTimeout(() => setBoardReady(true), 700);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (formData.origin.length === 3 && formData.dest.length === 3) {
            getDistance(formData.origin, formData.dest).then(res => {
                if (res.found) {
                    setFormData(prev => ({...prev, distance: res.distance}));
                }
            }).catch(() => {
            });
        }
    }, [formData.origin, formData.dest]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        const upper = ['origin', 'dest', 'carrier'].includes(name) ? value.toUpperCase() : value;
        setFormData(prev => ({...prev, [name]: upper}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const numOrNull = (v) => (v === '' || v === null || v === undefined) ? null : Number(v);

            const payload = {
                ...formData,
                distance: Number(formData.distance),
                crs_dep_hour: Number(formData.crs_dep_hour),
                crs_arr_hour: Number(formData.crs_arr_hour),
                temp: numOrNull(formData.temp),
                rhum: numOrNull(formData.rhum),
                prcp: numOrNull(formData.prcp),
                wspd: numOrNull(formData.wspd),
                pres: numOrNull(formData.pres),
            };
            const data = await predictDelay(payload);
            setResult(data);
            setHistory(prev => {
                const entry = {
                    origin: formData.origin,
                    dest: formData.dest,
                    carrier: formData.carrier,
                    distance: formData.distance,
                    fl_date: formData.fl_date,
                    crs_dep_hour: formData.crs_dep_hour,
                    crs_arr_hour: formData.crs_arr_hour,
                    temp: formData.temp,
                    rhum: formData.rhum,
                    prcp: formData.prcp,
                    wspd: formData.wspd,
                    pres: formData.pres,
                    status: data.predicted_status
                };
                const filtered = prev.filter(h => !(h.origin === entry.origin && h.dest === entry.dest && h.carrier === entry.carrier));
                return [entry, ...filtered].slice(0, 4);
            });
        } catch (err) {
            const detail = err.response?.data?.detail;
            setError(Array.isArray(detail) ? detail[0]?.msg : (detail || 'Prediction failed — check inputs'));
        } finally {
            setLoading(false);
        }
    };

    const statusText = result?.predicted_status === 'Delayed' ? 'DELAYED' : 'ON TIME';
    const boardClass = result?.predicted_status === 'Delayed' ? 'delayed' : 'not-delayed';
    const title = 'FLIGHT DELAY BOARD';

    return (
        <div className="app">
            <div className="board-header">
                <div>
                    <div className="eyebrow">Terminal · Predictive Ops</div>
                    <h1>
                        {title.split('').map((ch, i) => (
                            <span
                                key={i}
                                className={`flap-char header-flap ${boardReady ? 'settled' : ''}`}
                                style={{animationDelay: `${i * 0.03}s`}}
                            >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
                        ))}
                    </h1>
                </div>
                <div className="clock"><LiveClock/></div>
            </div>

            {history.length > 0 && (
                <div className="history-strip">
                    {history.map((h, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`history-chip ${h.status === 'Delayed' ? 'delayed' : 'not-delayed'}`}
                            onClick={() => setFormData({
                                origin: h.origin,
                                dest: h.dest,
                                carrier: h.carrier,
                                distance: h.distance,
                                fl_date: h.fl_date,
                                crs_dep_hour: h.crs_dep_hour,
                                crs_arr_hour: h.crs_arr_hour,
                                temp: h.temp,
                                rhum: h.rhum,
                                prcp: h.prcp,
                                wspd: h.wspd,
                                pres: h.pres
                            })}
                        >
                            {h.origin} → {h.dest} <span className="chip-carrier">{h.carrier}</span>
                        </button>
                    ))}
                </div>
            )}

            <form className="panel" onSubmit={handleSubmit}>
                <div className="grid">
                    <div className="route-row">
                        <AutocompleteField label="Origin" name="origin" value={formData.origin} options={airports}
                                           onChange={handleChange} placeholder="JFK" maxLength={3}/>
                        <span className="route-arrow">→</span>
                        <AutocompleteField label="Destination" name="dest" value={formData.dest} options={airports}
                                           onChange={handleChange} placeholder="LAX" maxLength={3}/>
                    </div>

                    <AutocompleteField label="Carrier" name="carrier" value={formData.carrier} options={carriers}
                                       onChange={handleChange} placeholder="AA" maxLength={2}/>

                    <div className="field">
                        <label>Distance (mi)</label>
                        <input type="number" name="distance" value={formData.distance} onChange={handleChange}
                               placeholder="2475" required/>
                    </div>

                    <div className="field">
                        <label>Flight Date</label>
                        <input type="date" name="fl_date" value={formData.fl_date} onChange={handleChange} required/>
                    </div>
                    <div className="field"/>

                    <div className="field">
                        <label>Sched. Departure (0–23)</label>
                        <input type="number" name="crs_dep_hour" min="0" max="23" value={formData.crs_dep_hour}
                               onChange={handleChange} required/>
                    </div>
                    <div className="field">
                        <label>Sched. Arrival (0–23)</label>
                        <input type="number" name="crs_arr_hour" min="0" max="23" value={formData.crs_arr_hour}
                               onChange={handleChange} required/>
                    </div>
                    <div className="field full">
                        <label style={{marginTop: '8px'}}>Weather (optional — leave blank for defaults)</label>
                    </div>

                    <div className="field">
                        <label>Temp (°C)</label>
                        <input type="number" name="temp" value={formData.temp} onChange={handleChange}
                               placeholder="15"/>
                    </div>
                    <div className="field">
                        <label>Humidity (%)</label>
                        <input type="number" name="rhum" value={formData.rhum} onChange={handleChange}
                               placeholder="50"/>
                    </div>
                    <div className="field">
                        <label>Precip (mm)</label>
                        <input type="number" name="prcp" value={formData.prcp} onChange={handleChange} placeholder="0"/>
                    </div>
                    <div className="field">
                        <label>Wind (km/h)</label>
                        <input type="number" name="wspd" value={formData.wspd} onChange={handleChange}
                               placeholder="10"/>
                    </div>
                    <div className="field">
                        <label>Pressure (hPa)</label>
                        <input type="number" name="pres" value={formData.pres} onChange={handleChange}
                               placeholder="1015"/>
                    </div>
                </div>

                <button className="submit-btn" type="submit" disabled={loading}>
                    {loading ? 'Reading the board…' : 'Predict Delay'}
                </button>

                {error && <div className="error-banner">⚠ {error}</div>}
            </form>

            {result && (
                <div className={`result-board ${boardClass}`}>
                    <div className="strip">
                        <span>{formData.origin} → {formData.dest}</span>
                        <span>{formData.fl_date}</span>
                    </div>
                    <div className="status-row">
                        {statusText.split('').map((ch, i) => (
                            <span key={i} className="flap-char" style={{animationDelay: `${i * 0.05}s`}}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
                        ))}
                    </div>
                    <div className="result-meta">
                        <div className="stat">
                            <div className="value">{(result.confidence * 100).toFixed(0)}%</div>
                            <div className="label">Confidence</div>
                            <div className="confidence-bar-track">
                                <div
                                    className={`confidence-bar-fill ${result.confidence > 0.65 ? 'high' : 'low'} ${boardClass}`}
                                    style={{width: `${result.confidence * 100}%`}}
                                />
                            </div>
                        </div>
                        <div className="stat">
                            <div
                                className="value">{result.predicted_delay_minutes > 0 ? '+' : ''}{result.predicted_delay_minutes.toFixed(1)}m
                            </div>
                            <div className="label">Est. Delay</div>
                        </div>
                    </div>
                    {result.weather_used && (
                        <div className="weather-chips">
                            <span className="weather-chip">🌡️ {result.weather_used.temp.toFixed(0)}°C</span>
                            <span className="weather-chip">💨 {result.weather_used.wspd.toFixed(0)} km/h</span>
                            <span className="weather-chip">🌧️ {result.weather_used.prcp.toFixed(1)}mm</span>
                        </div>
                    )}
                    {result.warnings?.length > 0 && (
                        <div className="warning-line">{result.warnings.join(' · ')}</div>
                    )}
                </div>
            )}
            <div className="footer-credit">Powered by LightGBM</div>
        </div>
    );
}

export default App;