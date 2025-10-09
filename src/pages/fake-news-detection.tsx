import React, { useState } from 'react';
import withAuth from '../components/withAuth';
import { Search, Send, CheckCircle, XCircle, Info, Link as LinkIcon } from 'lucide-react';

// API Configuration
const apiKey = ""; 
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

interface AnalysisResult {
    text: string;
    sources: { uri: string; title: string }[];
}

const FakeNewsDetectionPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Function to handle the API call with exponential backoff
    const fetchWithBackoff = async (url: string, payload: any, retries: number = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`API returned status ${response.status}`);
                }
                return await response.json();
            } catch (err) {
                if (i === retries - 1) throw err;
                const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s delay
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    const handleAnalysis = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);

        const systemPrompt = "You are Trustek, a dedicated fact-checker and journalist AI. Your task is to analyze the user's provided text or claim. Use Google Search grounding to verify the information. Provide a clear verdict (TRUE, FALSE, or UNVERIFIED) followed by a concise, explanatory summary of why the claim is trustworthy or misleading, citing the sources found.";
        
        const payload = {
            contents: [{ parts: [{ text: `Analyze the following claim/text for authenticity: "${query}"` }] }],
            tools: [{ "google_search": {} }], // Enable Google Search grounding
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        try {
            const response = await fetchWithBackoff(apiUrl, payload);
            const candidate = response.candidates?.[0];

            if (!candidate || !candidate.content?.parts?.[0]?.text) {
                throw new Error("Received an empty or malformed response from the AI.");
            }

            const text = candidate.content.parts[0].text;
            let sources: { uri: string; title: string }[] = [];

            // Extract grounding sources
            const groundingMetadata = candidate.groundingMetadata;
            if (groundingMetadata && groundingMetadata.groundingAttributions) {
                sources = groundingMetadata.groundingAttributions
                    .map(attribution => ({
                        uri: attribution.web?.uri,
                        title: attribution.web?.title,
                    }))
                    .filter(source => source.uri && source.title);
            }

            setResult({ text, sources });

        } catch (err) {
            console.error("Analysis failed:", err);
            setError("Failed to connect to the analysis service. Please check your network or try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Determine verdict for display styling
    const getVerdictStyle = (text: string) => {
        if (text.toUpperCase().includes("TRUE")) return { icon: <CheckCircle className="w-8 h-8 text-green-500" />, color: "bg-green-800/20 border-green-500", label: "VERIFIED" };
        if (text.toUpperCase().includes("FALSE")) return { icon: <XCircle className="w-8 h-8 text-red-500" />, color: "bg-red-800/20 border-red-500", label: "FALSE/MISLEADING" };
        return { icon: <Info className="w-8 h-8 text-yellow-500" />, color: "bg-yellow-800/20 border-yellow-500", label: "UNVERIFIED" };
    };

    return (
        <div className="min-h-screen container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-extrabold text-primary mb-2 text-shadow-lg dark:text-shadow-glow">
                Fake News Detection Tool
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
                Authenticate your claims using Google-grounded AI analysis.
            </p>
            
            <div className="bg-card p-8 rounded-xl shadow-2xl border border-border">
                <label htmlFor="content-query" className="flex items-center text-sm font-medium text-foreground mb-3">
                    <Search className="w-4 h-4 mr-2" /> Enter Text or Claim for Analysis:
                </label>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <textarea
                        id="content-query"
                        className="flex-grow p-4 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-smooth resize-none"
                        rows={5}
                        placeholder="e.g., 'The world's largest iceberg has just broken off Antarctica.'"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleAnalysis}
                        disabled={isLoading || !query.trim()}
                        className={`sm:w-40 px-6 py-3 flex justify-center items-center space-x-2 rounded-lg font-bold text-shadow-sm transition-smooth ${
                            isLoading ? 'bg-muted-foreground text-muted cursor-not-allowed' : 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-95'
                        }`}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                        ) : (
                            <><Send className="w-5 h-5" /> <span>Analyze</span></>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Message Display */}
            {error && (
                <div className="mt-8 p-4 bg-destructive/20 border border-destructive rounded-lg text-destructive-foreground">
                    <p className="font-semibold">{error}</p>
                </div>
            )}

            {/* Analysis Results Display */}
            {result && (
                <div className="mt-8">
                    <h2 className="text-3xl font-semibold text-foreground mb-4 text-shadow-sm">Analysis Report</h2>
                    
                    {/* Verdict Card */}
                    <div className={`p-6 rounded-xl border-l-4 ${getVerdictStyle(result.text).color} mb-6`}>
                        <div className="flex items-center space-x-4">
                            {getVerdictStyle(result.text).icon}
                            <div className="font-extrabold text-2xl">
                                Trustek Verdict: <span className="text-primary">{getVerdictStyle(result.text).label}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="bg-card p-6 rounded-xl shadow-lg border border-border mb-6">
                        <h3 className="text-xl font-bold mb-3 text-primary">Summary</h3>
                        <div className="whitespace-pre-wrap text-foreground">
                            {result.text}
                        </div>
                    </div>

                    {/* Sources */}
                    {result.sources.length > 0 && (
                        <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
                            <h3 className="text-xl font-bold mb-3 text-primary flex items-center space-x-2">
                                <LinkIcon className="w-5 h-5" />
                                <span>Verification Sources</span>
                            </h3>
                            <ul className="space-y-2 text-sm">
                                {result.sources.map((source, index) => (
                                    <li key={index} className="flex items-start text-muted-foreground">
                                        <span className="mr-2 text-primary">•</span>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" 
                                           className="hover:underline text-secondary transition-colors">
                                            {source.title} 
                                        </a>
                                        <span className="ml-2 text-xs opacity-50">({new URL(source.uri).hostname})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default withAuth(FakeNewsDetectionPage);
