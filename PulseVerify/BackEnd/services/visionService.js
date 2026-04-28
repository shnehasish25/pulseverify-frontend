/**
 * Vision Service — Google Cloud Vision API integration
 * Performs label detection, logo detection, and safe search analysis
 * on uploaded media assets. Falls back to a smart mock when
 * GOOGLE_CLOUD_VISION_API_KEY is not set.
 */

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Analyze an image URL using Google Cloud Vision API.
 * Returns structured analysis: labels, logos, and safe search scores.
 *
 * @param {string} imageUrl - Public URL of the image to analyze
 * @returns {Promise<object>} Vision analysis result
 */
export const analyzeWithVision = async (imageUrl) => {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  GOOGLE_CLOUD_VISION_API_KEY not set — using intelligent mock analysis.');
    return generateMockAnalysis(imageUrl);
  }

  try {
    const requestBody = {
      requests: [
        {
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'LOGO_DETECTION', maxResults: 5 },
            { type: 'SAFE_SEARCH_DETECTION' },
            { type: 'WEB_DETECTION', maxResults: 5 },
          ],
        },
      ],
    };

    const response = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Vision API error:', errText);
      return generateMockAnalysis(imageUrl);
    }

    const data = await response.json();
    const result = data.responses?.[0];

    if (!result) {
      return generateMockAnalysis(imageUrl);
    }

    // Extract labels
    const labels = (result.labelAnnotations || []).map((l) => ({
      description: l.description,
      score: Math.round(l.score * 100),
    }));

    // Extract logos
    const logos = (result.logoAnnotations || []).map((l) => ({
      description: l.description,
      score: Math.round(l.score * 100),
    }));

    // Web detection
    const webEntities = (result.webDetection?.webEntities || [])
      .filter((e) => e.description)
      .map((e) => ({
        description: e.description,
        score: Math.round((e.score || 0) * 100),
      }));

    // Determine if this is sports/media content
    const sportsLabels = ['sport', 'stadium', 'football', 'soccer', 'basketball', 'cricket',
      'tennis', 'baseball', 'athlete', 'player', 'match', 'league', 'broadcast',
      'competition', 'tournament', 'jersey', 'team'];

    const isSportsContent = labels.some((l) =>
      sportsLabels.some((s) => l.description.toLowerCase().includes(s))
    );

    const confidence = isSportsContent
      ? Math.min(99, 80 + labels.filter((l) =>
          sportsLabels.some((s) => l.description.toLowerCase().includes(s))
        ).length * 4)
      : Math.max(40, 70 - labels.length);

    return {
      isOfficial: isSportsContent && logos.length > 0,
      confidence,
      reasoning: buildReasoning(labels, logos, isSportsContent),
      labels,
      logos,
      webEntities,
      sportsContent: isSportsContent,
      analysisMethod: 'google_vision_api',
    };
  } catch (error) {
    console.error('Vision API request failed:', error.message);
    return generateMockAnalysis(imageUrl);
  }
};

/**
 * Build a human-readable reasoning string from Vision API data.
 */
function buildReasoning(labels, logos, isSportsContent) {
  const parts = [];

  if (isSportsContent) {
    const sportsLabelsFound = labels
      .filter((l) => ['sport', 'stadium', 'football', 'soccer', 'basketball', 'cricket',
        'player', 'athlete', 'match', 'broadcast', 'jersey'].some((s) =>
        l.description.toLowerCase().includes(s)
      ))
      .map((l) => l.description);

    parts.push(`Detected sports content: ${sportsLabelsFound.join(', ')}.`);
  }

  if (logos.length > 0) {
    parts.push(`Logos identified: ${logos.map((l) => `${l.description} (${l.score}%)`).join(', ')}.`);
  }

  if (labels.length > 0 && !isSportsContent) {
    parts.push(`Content labels: ${labels.slice(0, 5).map((l) => l.description).join(', ')}.`);
  }

  return parts.length > 0
    ? parts.join(' ')
    : 'No significant content markers detected.';
}

/**
 * Generates a realistic mock analysis when the Vision API is unavailable.
 */
function generateMockAnalysis(imageUrl) {
  const urlLower = imageUrl.toLowerCase();

  // Infer context from URL patterns
  const sportsKeywords = ['sport', 'match', 'game', 'league', 'nba', 'nfl', 'ipl',
    'premier', 'f1', 'wimbledon', 'final', 'highlight', 'bowl'];

  const isSportsUrl = sportsKeywords.some((k) => urlLower.includes(k));

  const mockLabels = isSportsUrl
    ? [
        { description: 'Sport', score: 96 },
        { description: 'Stadium', score: 91 },
        { description: 'Player', score: 88 },
        { description: 'Broadcast', score: 84 },
        { description: 'Team', score: 80 },
      ]
    : [
        { description: 'Digital media', score: 92 },
        { description: 'Video content', score: 87 },
        { description: 'Entertainment', score: 78 },
      ];

  const mockLogos = isSportsUrl
    ? [
        { description: 'Official Broadcast Logo', score: 94 },
        { description: 'League Watermark', score: 89 },
      ]
    : [];

  return {
    isOfficial: isSportsUrl,
    confidence: isSportsUrl ? 95 : 72,
    reasoning: isSportsUrl
      ? 'Mocked Analysis: High sports content indicators detected. Official broadcast markers match known patterns.'
      : 'Mocked Analysis: Content analyzed. No official sports markers found.',
    labels: mockLabels,
    logos: mockLogos,
    webEntities: [],
    sportsContent: isSportsUrl,
    analysisMethod: 'mock_inference',
  };
}
