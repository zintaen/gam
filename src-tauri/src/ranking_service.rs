use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use crate::git_service::GitAlias;

/// Time-based recency multipliers matching the README algorithm.
const MULTIPLIER_1H: f64 = 4.0;
const MULTIPLIER_1D: f64 = 2.0;
const MULTIPLIER_1W: f64 = 0.5;
const MULTIPLIER_OLD: f64 = 0.25;
/// If the total score across all aliases exceeds this threshold,
/// all frequencies are halved to prevent score inflation.
const SCORE_CEILING: f64 = 70_000.0;

/// Entry tracking both total frequency and most-recent timestamp.
struct HistoryEntry {
    frequency: f64,
    last_seen: u64, // Unix seconds
}

/// Ranks aliases by parsing shell history files.
///
/// Scoring formula:
///   Score = TimeMultiplier × Length^(3/5) × Frequency
///
/// Where:
/// - TimeMultiplier is based on the recency of last usage
/// - Length is the character length of the aliased command
/// - Frequency is how often the command appears in history
pub struct RankingService {
    history_cache: HashMap<String, HistoryEntry>,
    last_fetch_time: Option<Instant>,
    cache_ttl: Duration,
}

impl RankingService {
    pub fn new() -> Self {
        Self {
            history_cache: HashMap::new(),
            last_fetch_time: None,
            cache_ttl: Duration::from_secs(5),
        }
    }

    pub fn get_scores(
        &mut self,
        aliases: &[GitAlias],
    ) -> Result<HashMap<String, f64>, String> {
        let should_refresh = match self.last_fetch_time {
            Some(t) => t.elapsed() > self.cache_ttl,
            None => true,
        };

        if should_refresh || self.history_cache.is_empty() {
            self.refresh_history_cache();
            self.last_fetch_time = Some(Instant::now());
        }

        let now_secs = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        let mut scores: HashMap<String, f64> = HashMap::new();
        let mut total_score: f64 = 0.0;

        for alias in aliases {
            let entry = self.history_cache.get(&format!("git {}", alias.name));

            let (frequency, last_seen) = match entry {
                Some(e) => (e.frequency, e.last_seen),
                None => {
                    // Fall back to base command matching
                    let base_cmd = alias.command.split_whitespace().next().unwrap_or("");
                    let base_entry = self.history_cache.get(&format!("git {}", base_cmd));
                    match base_entry {
                        Some(e) => (e.frequency * 0.2, e.last_seen),
                        None => {
                            scores.insert(alias.name.clone(), 0.0);
                            continue;
                        }
                    }
                }
            };

            // Time multiplier based on recency
            let elapsed = if last_seen > 0 { now_secs.saturating_sub(last_seen) } else { u64::MAX };
            let time_multiplier = if elapsed <= 3600 {
                MULTIPLIER_1H
            } else if elapsed <= 86400 {
                MULTIPLIER_1D
            } else if elapsed <= 604800 {
                MULTIPLIER_1W
            } else {
                MULTIPLIER_OLD
            };

            // Length factor: command length ^ (3/5)
            let length_factor = (alias.command.len() as f64).powf(0.6);

            let score = (time_multiplier * length_factor * frequency).round();
            total_score += score;
            scores.insert(alias.name.clone(), score);
        }

        // Auto-reset: halve all frequencies when total exceeds ceiling
        if total_score > SCORE_CEILING {
            for entry in self.history_cache.values_mut() {
                entry.frequency /= 2.0;
            }
            // Recalculate scores with halved frequencies
            for (_, score) in scores.iter_mut() {
                *score /= 2.0;
            }
        }

        Ok(scores)
    }

    fn refresh_history_cache(&mut self) {
        let mut new_cache: HashMap<String, HistoryEntry> = HashMap::new();
        let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));

        if cfg!(not(target_os = "windows")) {
            // Try zsh history (format: ": timestamp:0;command")
            let zsh_path = home.join(".zsh_history");
            if let Ok(content) = fs::read_to_string(&zsh_path) {
                Self::parse_zsh_history(&content, &mut new_cache);
            }

            // Try bash history (plain lines, no timestamps)
            let bash_path = home.join(".bash_history");
            if let Ok(content) = fs::read_to_string(&bash_path) {
                Self::parse_plain_history(&content, &mut new_cache);
            }
        } else {
            // PowerShell history on Windows
            let ps_path = home
                .join("AppData")
                .join("Roaming")
                .join("Microsoft")
                .join("Windows")
                .join("PowerShell")
                .join("PSReadLine")
                .join("ConsoleHost_history.txt");
            if let Ok(content) = fs::read_to_string(&ps_path) {
                Self::parse_plain_history(&content, &mut new_cache);
            }
        }

        self.history_cache = new_cache;
    }

    /// Parse zsh history with timestamps: ": 1234567890:0;git checkout main"
    fn parse_zsh_history(content: &str, cache: &mut HashMap<String, HistoryEntry>) {
        if let Ok(re) = regex_lite::Regex::new(r":\s*(\d+):\d+;.*?git\s+([\w-]+)") {
            for cap in re.captures_iter(content) {
                if let (Some(ts), Some(cmd)) = (cap.get(1), cap.get(2)) {
                    let timestamp: u64 = ts.as_str().parse().unwrap_or(0);
                    let key = format!("git {}", cmd.as_str());
                    let entry = cache.entry(key).or_insert(HistoryEntry {
                        frequency: 0.0,
                        last_seen: 0,
                    });
                    entry.frequency += 1.0;
                    if timestamp > entry.last_seen {
                        entry.last_seen = timestamp;
                    }
                }
            }
        }

        // Also match plain "git xxx" lines without the timestamp prefix
        if let Ok(re) = regex_lite::Regex::new(r"(?m)^git\s+([\w-]+)") {
            for cap in re.captures_iter(content) {
                if let Some(cmd) = cap.get(1) {
                    let key = format!("git {}", cmd.as_str());
                    let entry = cache.entry(key).or_insert(HistoryEntry {
                        frequency: 0.0,
                        last_seen: 0,
                    });
                    entry.frequency += 1.0;
                }
            }
        }
    }

    /// Parse plain history (bash, PowerShell) — no timestamps available.
    fn parse_plain_history(content: &str, cache: &mut HashMap<String, HistoryEntry>) {
        if let Ok(re) = regex_lite::Regex::new(r"git\s+([\w-]+)") {
            for cap in re.captures_iter(content) {
                if let Some(m) = cap.get(1) {
                    let key = format!("git {}", m.as_str());
                    let entry = cache.entry(key).or_insert(HistoryEntry {
                        frequency: 0.0,
                        last_seen: 0,
                    });
                    entry.frequency += 1.0;
                    // No timestamp info for plain history
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_service_has_empty_cache() {
        let svc = RankingService::new();
        assert!(svc.history_cache.is_empty());
        assert!(svc.last_fetch_time.is_none());
    }

    #[test]
    fn scores_empty_aliases() {
        let mut svc = RankingService::new();
        let aliases: Vec<GitAlias> = vec![];
        let scores = svc.get_scores(&aliases).unwrap();
        assert!(scores.is_empty());
    }

    #[test]
    fn scores_alias_with_no_history() {
        let mut svc = RankingService::new();
        let aliases = vec![GitAlias {
            name: "co".to_string(),
            command: "checkout".to_string(),
            scope: "global".to_string(),
            local_path: None,
            score: None,
        }];
        let scores = svc.get_scores(&aliases).unwrap();
        assert_eq!(*scores.get("co").unwrap(), 0.0);
    }

    #[test]
    fn parse_zsh_history_extracts_timestamps() {
        let content = ": 1700000000:0;git checkout main\n: 1700000100:0;git status\n";
        let mut cache = HashMap::new();
        RankingService::parse_zsh_history(content, &mut cache);

        let co = cache.get("git checkout").unwrap();
        assert_eq!(co.frequency, 1.0);
        assert_eq!(co.last_seen, 1700000000);

        let st = cache.get("git status").unwrap();
        assert_eq!(st.frequency, 1.0);
        assert_eq!(st.last_seen, 1700000100);
    }

    #[test]
    fn parse_plain_history_counts_frequency() {
        let content = "git commit -m 'test'\ngit commit --amend\nls -la\ngit status\n";
        let mut cache = HashMap::new();
        RankingService::parse_plain_history(content, &mut cache);

        assert_eq!(cache.get("git commit").unwrap().frequency, 2.0);
        assert_eq!(cache.get("git status").unwrap().frequency, 1.0);
        assert!(cache.get("git ls").is_none());
    }

    #[test]
    fn time_multipliers_are_correct() {
        // Verify the constants match the README
        assert_eq!(MULTIPLIER_1H, 4.0);
        assert_eq!(MULTIPLIER_1D, 2.0);
        assert_eq!(MULTIPLIER_1W, 0.5);
        assert_eq!(MULTIPLIER_OLD, 0.25);
    }
}
