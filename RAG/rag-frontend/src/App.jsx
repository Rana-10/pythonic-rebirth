import {useState, useRef, useEffect} from "react";
import "./App.css";

const API_URL = "http://localhost:8000/chat";

const EXAMPLE_QUESTIONS = [
    {icon: "◆", text: "What is retrieval augmented generation?"},
    {icon: "◇", text: "How does RAG reduce hallucinations?"},
    {icon: "◆", text: "What are common evaluation metrics for RAG?"},
    {icon: "◇", text: "What is the difference between fine-tuning and RAG?"},
];

function RelevanceBar({score}) {
    const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
    return (
        <div className="relevance">
            <div className="relevance-track">
                <div className="relevance-fill" style={{width: `${pct}%`}}/>
            </div>
            <span className="relevance-pct">{pct}%</span>
        </div>
    );
}

function SourcesPanel({sources}) {
    const [open, setOpen] = useState(false);
    if (!sources || sources.length === 0) return null;

    return (
        <div className="sources">
            <button className="sources-toggle" onClick={() => setOpen(!open)}>
                <span className={`chevron ${open ? "open" : ""}`}>›</span>
                {sources.length} source{sources.length > 1 ? "s" : ""} retrieved
            </button>
            <div className={`sources-list ${open ? "open" : ""}`}>
                {sources.map((s, i) => (
                    <div key={i} className="source-card">
                        <div className="source-icon">◆</div>
                        <div className="source-body">
                            <div className="source-doc">{s.source_document}</div>
                            <div className="source-meta">page {s.page} · chunk {s.chunk_number}</div>
                            <RelevanceBar score={s.similarity_score}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages, loading]);

    const sendMessage = async (overrideText) => {
        const question = (overrideText ?? input).trim();
        if (!question || loading) return;

        setMessages((prev) => [...prev, {role: "user", text: question}]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({question, k: 5}),
            });

            if (!res.ok) throw new Error("request failed");

            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                {role: "bot", text: data.answer, sources: data.sources},
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {role: "bot", text: "Something went wrong answering that — please try again.", error: true},
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="app-shell">
            <header className="hero">
                <div className="hero-glow glow-a"/>
                <div className="hero-glow glow-b"/>
                <div className="hero-content">
                    <div className="brand">
                        <div className="brand-mark">R</div>
                        <div>
                            <div className="brand-name">Research Assistant</div>
                            <div className="brand-sub">RAG knowledge base over your paper corpus</div>
                        </div>
                    </div>
                    <div className="status-pill">
                        <span className="status-dot"/>
                        Online
                    </div>
                </div>
            </header>

            <main className="chat-main">
                <div className="chat-scroll">
                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-mark">R</div>
                            <h2>Ask me about your research papers</h2>
                            <p>I retrieve relevant passages from your corpus and answer grounded in that context.</p>
                            <div className="example-grid">
                                {EXAMPLE_QUESTIONS.map((q, i) => (
                                    <button key={i} className="example-card" onClick={() => sendMessage(q.text)}>
                                        <span className="example-icon">{q.icon}</span>
                                        {q.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="messages">
                            {messages.map((msg, i) => (
                                <div key={i} className={`message-row ${msg.role}`}>
                                    <div className={`bubble ${msg.role} ${msg.error ? "error" : ""}`}>
                                        {msg.text}
                                    </div>
                                    <SourcesPanel sources={msg.sources}/>
                                </div>
                            ))}
                            {loading && (
                                <div className="message-row bot">
                                    <div className="bubble bot loading-bubble">
                                        <span className="spinner"/>
                                        Retrieving knowledge…
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef}/>
                        </div>
                    )}
                </div>

                <div className="composer-wrap">
                    <div className="composer">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about the papers..."
                rows={1}
                disabled={loading}
            />
                        <button
                            className="send-btn"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                        >
                            {loading ? "···" : "Send"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;