import { PassVector, Player } from '../types';

export interface AiInsightResponse {
  id: string;
  timestamp: string;
  headline: string;
  summary: string;
  keyPass: {
    index: number;
    passer: string;
    receiver: string;
    dist: string;
    xt: string;
    type: string;
    reason: string;
  };
  metrics: {
    totalXt: string;
    lineBreaks: number;
    passingEfficiency: string;
    turnoverRisk: string;
    verticalGainMeters: number;
  };
  tacticalFlawExploited: string;
  recommendations: string[];
}

export function generateMockAiInsight(
  vectors: PassVector[],
  allPlayers: Player[],
  homeTeamName: string = 'Manchester Blue',
  awayTeamName: string = 'Real Madrid CF'
): AiInsightResponse {
  if (vectors.length === 0) {
    return {
      id: `insight_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      headline: 'No Active Pass Vectors Detected',
      summary: 'Draw vectors between players on the Pitch Workbench to initiate tactical spatial analysis.',
      keyPass: {
        index: 0,
        passer: 'N/A',
        receiver: 'N/A',
        dist: '0m',
        xt: '+0.00',
        type: 'ground',
        reason: 'No passing sequence recorded.'
      },
      metrics: {
        totalXt: '+0.00',
        lineBreaks: 0,
        passingEfficiency: '0%',
        turnoverRisk: '0%',
        verticalGainMeters: 0
      },
      tacticalFlawExploited: 'Awaiting tactical input.',
      recommendations: ['Click any player on the pitch and select a target player to draw a pass vector.']
    };
  }

  // Find key pass with highest numeric xt
  let bestIdx = 0;
  let maxXtNum = -1;
  let totalXtNum = 0;
  let totalDistMeters = 0;

  vectors.forEach((v, idx) => {
    const val = parseFloat(v.xt.replace('+', '')) || 0.1;
    totalXtNum += val;
    const distNum = parseInt(v.dist) || 20;
    totalDistMeters += distNum;

    if (val > maxXtNum) {
      maxXtNum = val;
      bestIdx = idx;
    }
  });

  const keyVec = vectors[bestIdx];
  const pFrom = allPlayers.find((p) => p.id === keyVec.from);
  const pTo = allPlayers.find((p) => p.id === keyVec.to);

  const passerName = pFrom ? `#${pFrom.num} ${pFrom.name} (${pFrom.pos})` : 'Player A';
  const receiverName = pTo ? `#${pTo.num} ${pTo.name} (${pTo.pos})` : 'Player B';

  const lineBreaks = Math.max(1, Math.round(vectors.length * 0.7));
  const efficiencyPct = Math.min(97, 76 + vectors.length * 3);
  const riskPct = Math.max(8, 28 - vectors.length * 2);

  return {
    id: `insight_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    headline: `Vertical Line-Breaking Sequence (+${totalXtNum.toFixed(2)} Net Threat)`,
    summary: `This ${vectors.length}-pass combination illustrates a calibrated build-up progression by ${homeTeamName}. The sequence effectively navigates around ${awayTeamName}'s mid-block structure by manipulating second-line pressing angles before injecting vertical velocity into high-value central channels.`,
    keyPass: {
      index: bestIdx + 1,
      passer: passerName,
      receiver: receiverName,
      dist: keyVec.dist,
      xt: keyVec.xt,
      type: keyVec.type === 'aerial' ? 'Aerial Cross' : keyVec.type === 'through' ? 'Through Run' : 'Ground Pass',
      reason: `Pass #${bestIdx + 1} generated the maximum threat increment (${keyVec.xt} xT). It punctured the defensive line at high velocity, shifting the attack into the final third with numerical superiority.`
    },
    metrics: {
      totalXt: `+${totalXtNum.toFixed(2)}`,
      lineBreaks: lineBreaks,
      passingEfficiency: `${efficiencyPct}%`,
      turnoverRisk: `${riskPct}%`,
      verticalGainMeters: Math.round(totalDistMeters * 0.85)
    },
    tacticalFlawExploited: `The sequence baited ${awayTeamName}'s defensive pivot into vacating Zone 14. This created a 12-meter vacuum between the opposition center-backs and holding midfielders that was promptly exploited before recovery compacting could occur.`,
    recommendations: [
      `Maintain third-man support runs from the opposite half-space to capitalize on the unbalanced center-back pairing.`,
      `If the opposition increases aggressive step-up pressure, leverage an early clipped aerial delivery into the vacated corridor behind the full-back.`,
      `Target cut-back deliveries toward the edge of the penalty box where secondary trailing runners have open sightlines.`
    ]
  };
}

export const PRESET_CHAT_ANSWERS: Record<string, string> = {
  risk: "Turnover risk remains low (under 18%) provided the initial ground pass from the center-back retains a velocity above 16 m/s. If the ball is played under-hit, Madrid's midfield double pivot can initiate a rapid transition.",
  press: "To counter this progression, the defending side must execute a coordinated squeeze: the central midfielder should jump onto the receiver while the ball-near winger tucks inside to choke the half-space passing angle.",
  alternative: "An alternative progression would have involved switching diagonally to the opposite flank to isolate the 1v1 winger against the isolated full-back, pinning their defensive line deeper.",
  default: "Analytical telemetry confirms that the passing angles successfully exploited the blind spot of the opposition cover shadow, yielding high expected threat and minimal interception risk."
};
