export const ARTICLE_CATEGORIES = [
  'Climate Change',
  'Pollution',
  'Renewable Energy',
  'Wildlife',
  'Waste Management',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

const categoryTerms: Record<ArticleCategory, Record<string, number>> = {
  'Climate Change': {
    climate: 3, warming: 3, greenhouse: 3, emissions: 2, carbon: 2,
    drought: 1, heatwave: 2, temperature: 1, methane: 2, weather: 1,
  },
  Pollution: {
    pollution: 3, polluted: 3, contaminant: 2, contamination: 3, smog: 3,
    toxic: 2, air: 1, water: 1, chemical: 2, particulate: 3, plastic: 1,
  },
  'Renewable Energy': {
    renewable: 3, solar: 3, wind: 3, turbine: 2, electricity: 1, energy: 2,
    battery: 2, geothermal: 3, hydropower: 3, clean: 1, grid: 1,
  },
  Wildlife: {
    wildlife: 3, species: 2, habitat: 3, biodiversity: 3, animal: 2,
    migration: 2, endangered: 3, ecosystem: 2, coral: 2, population: 1,
  },
  'Waste Management': {
    waste: 3, recycling: 3, recycle: 3, landfill: 3, compost: 3,
    garbage: 3, disposal: 2, reuse: 2, packaging: 1,
  },
};

const stopWords = new Set([
  'about', 'after', 'again', 'also', 'among', 'because', 'been', 'before',
  'being', 'between', 'could', 'during', 'each', 'from', 'have', 'into',
  'more', 'most', 'other', 'over', 'said', 'some', 'such', 'than', 'that',
  'their', 'there', 'these', 'they', 'this', 'those', 'through', 'under',
  'very', 'were', 'what', 'when', 'where', 'which', 'while', 'with', 'would',
  'will', 'your', 'were', 'the', 'and', 'for', 'are', 'but', 'not', 'you',
  'its', 'has', 'had', 'was', 'can', 'may', 'our', 'out', 'who', 'all',
  'one', 'two', 'new', 'now', 'per', 'she', 'him', 'her', 'his', 'how',
  'any', 'use', 'used', 'using', 'like', 'many', 'much', 'make', 'made',
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'-]*/g) ?? [];
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [];
}

function classify(text: string): ArticleCategory {
  const tokens = tokenize(text);
  const scores = ARTICLE_CATEGORIES.map((category) => {
    const terms = categoryTerms[category];
    const score = tokens.reduce((sum, token) => sum + (terms[token] ?? 0), 0);
    return { category, score };
  });
  return scores.reduce((best, current) => current.score > best.score ? current : best).category;
}

function chooseSentences(sentences: string[], text: string): string[] {
  if (sentences.length <= 3) return sentences;

  const frequencies = new Map<string, number>();
  tokenize(text)
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .forEach((word) => frequencies.set(word, (frequencies.get(word) ?? 0) + 1));
  const maxFrequency = Math.max(1, ...frequencies.values());

  const ranked = sentences.map((sentence, index) => {
    const words = tokenize(sentence).filter((word) => word.length > 3 && !stopWords.has(word));
    const relevance = words.reduce((total, word) => total + (frequencies.get(word) ?? 0) / maxFrequency, 0);
    const positionBoost = index === 0 ? 1.15 : index === 1 ? 0.35 : 0;
    const lengthPenalty = words.length < 5 ? 1.5 : 0;
    return { index, score: relevance + positionBoost - lengthPenalty };
  });

  return ranked
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map(({ index }) => sentences[index]);
}

export function summarizeArticle(article: string): {
  summary: string;
  category: ArticleCategory;
  sentenceCount: number;
} {
  const sentences = splitSentences(article);
  const selected = chooseSentences(sentences, article);
  return {
    summary: selected.join(' '),
    category: classify(article),
    sentenceCount: selected.length,
  };
}
