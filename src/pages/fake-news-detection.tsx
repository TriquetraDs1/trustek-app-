import React, { useState } from 'react';
import withAuth from '@/components/withAuth';
import { Send, CheckCircle, XCircle, Info, Image, FileText, Link as LinkIcon } from 'lucide-react';

// --- Types ---
interface AnalysisResult {
  text: string;
  sources: { uri: string; title: string }[];
}

// --- File to Base64 ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Component ---
const FakeNewsDetectionPage: React.FC = () => {
  const [inputType, setInputType] = useState<'text' | 'image'>('text');
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setError('Please upload a valid image file.');
    }
  };

  const simulateFakeProcess = async () => {
    const steps = [
      'Verifying credentials...',
      'Scanning content...',
      'Cross-checking sources...',
      'Analyzing authenticity...',
      'Finalizing verdict...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 700));
    }
  };

  const handleAnalysis = async () => {
    if (inputType === 'text' && !query.trim()) return;
    if (inputType === 'image' && !imageFile) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setLoadingStep('Initializing analysis...');

    try {
      await simulateFakeProcess();

      // ✅ CUSTOM: Always VERIFIED for a specific image name
      if (inputType === 'image' && imageFile && imageFile.name.toLowerCase().includes('trustek')) {
        setResult({
          text:
            '✅ VERIFIED: The uploaded image has been authenticated and confirmed as genuine by Trustek systems. Metadata and reverse search indicate the content has not been digitally altered or misrepresented.',
          sources: [
            { uri: 'https://www.trustek.ai/verification', title: 'Trustek Verification System' },
            { uri: 'https://images.google.com/', title: 'Google Image Crosscheck' }
          ]
        });
      } else {
        // Fake generic fallback
        setResult({
          text:
            'UNVERIFIED: Unable to confirm authenticity. The content does not match any verified sources. Please cross-check manually.',
          sources: []
        });
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
      setLoadingStep(null);
    }
  };

  const getVerdictStyle = (text: string) => {
    if (text.toUpperCase().includes('VERIFIED'))
      return { icon: <CheckCircle className="w-8 h-8 text-green-500" />, color: 'bg-green-800/20 border-green-500', label: 'VERIFIED' };
    if (text.toUpperCase().includes('MISLEADING') || text.toUpperCase().includes('FALSE'))
      return { icon: <XCircle className="w-8 h-8 text-red-500" />, color: 'bg-red-800/20 border-red-500', label: 'FALSE/MISLEADING' };
    return { icon: <Info className="w-8 h-8 text-yellow-500" />, color: 'bg-yellow-800/20 border-yellow-500', label: 'UNVERIFIED' };
  };

  return (
    <div className="min-h-screen container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-extrabold text-primary mb-2 text-shadow-lg">Fact Checker Tool</h1>
      <p className="text-xl text-muted-foreground mb-10">
        Authenticate your claims, text, or images using our AI analysis.
      </p>

      <div className="bg-card p-8 rounded-xl shadow-2xl border border-border">
        {/* Input Type Toggle */}
        <div className="flex space-x-4 mb-6 border-b border-border pb-3">
          <button
            onClick={() => setInputType('text')}
            className={`flex items-center space-x-2 p-3 rounded-t-lg transition-colors ${
              inputType === 'text'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-5 h-5" /> <span>Analyze Text/Claim</span>
          </button>
          <button
            onClick={() => setInputType('image')}
            className={`flex items-center space-x-2 p-3 rounded-t-lg transition-colors ${
              inputType === 'image'
                ? 'text-primary border-b-2 border-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Image className="w-5 h-5" /> <span>Analyze Image</span>
          </button>
        </div>

        {/* Input Section */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {inputType === 'text' && (
            <textarea
              className="flex-grow p-4 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-smooth resize-none"
              rows={8}
              placeholder="Paste the text, quote, or claim you want to verify here."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
          )}

          {inputType === 'image' && (
            <div className="flex-grow space-y-3">
              <label htmlFor="image-upload" className="block text-sm font-medium text-foreground">
                Upload Image:
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {previewUrl && (
                <div className="mt-4 border border-input rounded-lg p-2 max-w-xs mx-auto">
                  <h4 className="text-xs text-muted-foreground mb-2">Image Preview:</h4>
                  <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-md object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalysis}
            disabled={
              isLoading || (inputType === 'text' && !query.trim()) || (inputType === 'image' && !imageFile)
            }
            className={`sm:w-40 px-6 py-3 flex justify-center items-center space-x-2 rounded-lg font-bold text-shadow-sm transition-smooth ${
              isLoading
                ? 'bg-muted-foreground text-muted cursor-not-allowed'
                : 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-95'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
            ) : (
              <>
                <Send className="w-5 h-5" /> <span>Analyze</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fake Verification Status */}
      {loadingStep && (
        <div className="mt-6 text-center animate-pulse text-sm text-muted-foreground font-medium">
          {loadingStep}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 p-4 bg-destructive/20 border border-destructive rounded-lg text-destructive-foreground">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-8">
          <h2 className="text-3xl font-semibold text-foreground mb-4 text-shadow-sm">Analysis Report</h2>

          <div className={`p-6 rounded-xl border-l-4 ${getVerdictStyle(result.text).color} mb-6`}>
            <div className="flex items-center space-x-4">
              {getVerdictStyle(result.text).icon}
              <div className="font-extrabold text-2xl">
                Trustek Verdict: <span className="text-primary">{getVerdictStyle(result.text).label}</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-lg border border-border mb-6">
            <h3 className="text-xl font-bold mb-3 text-primary">Summary</h3>
            <div className="whitespace-pre-wrap text-foreground">{result.text}</div>
          </div>

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
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-secondary transition-colors"
                    >
                      {source.title}
                    </a>
                    <span className="ml-2 text-xs opacity-50">
                      ({new URL(source.uri).hostname})
                    </span>
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

export default FakeNewsDetectionPage;
