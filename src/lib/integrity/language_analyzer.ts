export interface LanguageMetrics {
  totalWords: number;
  uniqueWords: number;
  lexicalDiversity: number; // TTR: Type-Token Ratio (0.0 to 1.0)
  averageSentenceLength: number;
  technicalTermCount: number;
  technicalDensity: number;
}

export class LanguageAnalyzer {
  private static readonly COMMON_TECHNICAL_TERMS = new Set([
    "api", "database", "query", "index", "cache", "redis", "latency", "throughput",
    "microservices", "docker", "kubernetes", "partition", "sharding", "acid", "jwt",
    "oauth", "rest", "graphql", "concurrency", "thread", "async", "await", "promise",
    "distributed", "consensus", "kafka", "queue", "worker", "load balancer", "gateway",
    "middleware", "memory", "leak", "profiling", "schema", "normalization", "nosql",
    "sql", "event", "socket", "websocket", "state", "redux", "react", "node", "typescript"
  ]);

  /**
   * Analyzes linguistic characteristics of an answer transcript
   */
  public static analyzeTranscript(transcript: string): LanguageMetrics {
    const cleaned = transcript.toLowerCase().trim();
    if (!cleaned) {
      return {
        totalWords: 0,
        uniqueWords: 0,
        lexicalDiversity: 0,
        averageSentenceLength: 0,
        technicalTermCount: 0,
        technicalDensity: 0,
      };
    }

    const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = cleaned.split(/\s+/).map((w) => w.replace(/[^a-z0-9_-]/g, "")).filter(Boolean);

    const totalWords = words.length;
    const uniqueWordSet = new Set(words);
    const uniqueWords = uniqueWordSet.size;
    const lexicalDiversity = totalWords > 0 ? Math.round((uniqueWords / totalWords) * 100) / 100 : 0;

    const averageSentenceLength =
      sentences.length > 0 ? Math.round((totalWords / sentences.length) * 10) / 10 : totalWords;

    let technicalTermCount = 0;
    for (const word of words) {
      if (this.COMMON_TECHNICAL_TERMS.has(word)) {
        technicalTermCount++;
      }
    }

    const technicalDensity =
      totalWords > 0 ? Math.round((technicalTermCount / totalWords) * 100) / 100 : 0;

    return {
      totalWords,
      uniqueWords,
      lexicalDiversity,
      averageSentenceLength,
      technicalTermCount,
      technicalDensity,
    };
  }

  /**
   * Evaluates if there is a sudden style or vocabulary leap
   */
  public static detectStyleShift(
    priorMetrics: LanguageMetrics[],
    currentMetrics: LanguageMetrics
  ): {
    hasShift: boolean;
    observation: string | null;
  } {
    if (priorMetrics.length < 2) {
      return { hasShift: false, observation: null };
    }

    const avgPriorDensity =
      priorMetrics.reduce((acc, m) => acc + m.technicalDensity, 0) / priorMetrics.length;
    const avgPriorDiversity =
      priorMetrics.reduce((acc, m) => acc + m.lexicalDiversity, 0) / priorMetrics.length;

    // Significant upward jump in technical terms (> 3x earlier baseline)
    if (currentMetrics.technicalDensity > avgPriorDensity * 2.8 && currentMetrics.totalWords > 30) {
      return {
        hasShift: true,
        observation: "Notable elevation in technical terminology density relative to earlier conversational answers.",
      };
    }

    return { hasShift: false, observation: null };
  }
}
