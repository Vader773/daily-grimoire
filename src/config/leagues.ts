export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'boss';

export const XP_VALUES: Record<Difficulty, number> = {
    trivial: 5,
    easy: 10,
    medium: 25,
    hard: 50,
    boss: 100,
};

// Monthly league thresholds (based on monthly XP, resets each month)
export const LEAGUE_THRESHOLDS = {
    bronze: 0,
    silver: 500,
    gold: 1500,
    platinum: 3000,
    diamond: 5000,
    master: 8000,
    grandmaster: 12000,
    champion: 18000,
    legend: 25000,
    immortal: 35000,
};

// Helper to get next league threshold
export const getNextLeagueThreshold = (currentXP: number) => {
    const entries = Object.entries(LEAGUE_THRESHOLDS).sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < entries.length; i++) {
        if (currentXP < entries[i][1]) {
            return {
                league: entries[i][0],
                threshold: entries[i][1]
            };
        }
    }
    return null; // Max league
};
