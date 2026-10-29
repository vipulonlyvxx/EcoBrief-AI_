import { type FormEvent, type ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ArrowRight, BookOpenText, Check, Leaf, LockKeyhole, Sprout } from 'lucide-react';
import { summarizeArticle, type ArticleCategory } from './lib/summarize-article';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [article, setArticle] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ summary: string; category: ArticleCategory; sentenceCount: number } | null>(null);
  const wordCount = article.trim() ? article.trim().split(/\s+/).length : 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!article.trim()) {
      setResult(null);
      setError('Add an article first so there’s something to summarize.');
      return;
    }
    setError('');
    setResult(summarizeArticle(article.trim()));
  }

  return (
    <main className="page-shell">
      <div className="content-wrap">
        <header className="topbar">
          <div className="brand" aria-label="EcoBrief AI">
            <span className="brand-mark"><Leaf size={18} strokeWidth={2.2} /></span>
            <span>ecobrief<span style={{ color: '#73937a' }}>.</span></span>
          </div>
          <div className="top-note"><BookOpenText size={14} /> A clearer read on the planet</div>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="eyebrow">Your environmental news companion</div>
          <h1 id="hero-title">EcoBrief AI — <br /><em>Environmental News Summarizer</em></h1>
          <p>Paste in an environmental news article. Get the key points and a topic label to help you find your footing before you dive deeper.</p>
        </section>

        <section className="workspace" aria-label="Article summarizer">
          <form className="input-panel" onSubmit={handleSubmit} noValidate>
            <div className="panel-heading">
              <div>
                <h2>Start with an article</h2>
                <p>Paste the article text below to get a quick brief.</p>
              </div>
              <span className="word-count" data-testid="text-word-count">{wordCount} words</span>
            </div>
            <label htmlFor="article-text" className="sr-only">Environmental news article text</label>
            <textarea
              id="article-text"
              className="article-input"
              data-testid="input-article"
              value={article}
              onChange={(event) => {
                setArticle(event.target.value);
                if (error) setError('');
              }}
              placeholder="Paste an article here…"
              aria-describedby={error ? 'article-error' : 'local-method'}
              aria-invalid={Boolean(error)}
            />
            {error && <p id="article-error" className="error-message" role="alert" data-testid="status-empty-input">{error}</p>}
            <div className="input-footer">
              <span id="local-method" className="local-note"><LockKeyhole size={13} /> Runs locally in your browser</span>
              <button type="submit" className="submit-button" data-testid="button-summarize">
                Summarize News <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <aside className="aside-card" aria-label="How EcoBrief works">
            <div className="aside-kicker">A study companion, not a shortcut</div>
            <h3>Get oriented.<br />Then read on.</h3>
            <p>EcoBrief picks useful sentences from the text you provide and estimates its topic using a small set of environmental keywords.</p>
            <div className="category-list" aria-label="Available categories">
              <span className="category-tag">Climate Change</span>
              <span className="category-tag">Pollution</span>
              <span className="category-tag">Renewable Energy</span>
              <span className="category-tag">Wildlife</span>
              <span className="category-tag">Waste Management</span>
            </div>
          </aside>
        </section>

        {result && (
          <section className="result-panel" aria-live="polite" data-testid="section-summary">
            <div className="result-top">
              <div className="result-label"><Check size={15} /> Your quick brief</div>
              <span className="category-pill" data-testid="text-category">{result.category}</span>
            </div>
            <div className="result-content">
              <h2>What’s going on</h2>
              <p className="summary-text" data-testid="text-summary">{result.summary || 'We couldn’t find complete sentences in that text. Try adding a little more of the article.'}</p>
            </div>
            <div className="result-footnote">
              <Sprout size={14} />
              <span>Extractive summary · {result.sentenceCount} {result.sentenceCount === 1 ? 'sentence' : 'sentences'} selected. Keyword-based topic estimate. Check the original article for full context and expert analysis.</span>
            </div>
          </section>
        )}

        <footer className="footer">
          <span><strong>EcoBrief AI</strong> · Made for curious readers</span>
          <span>Local, keyword-based summarization · No article is sent anywhere</span>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
