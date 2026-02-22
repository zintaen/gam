use std::process::Command;

use serde::{Deserialize, Serialize};

use crate::known_repos_service::KnownReposService;
use crate::ranking_service::RankingService;

/// Patterns in alias commands that are considered dangerous.
static DANGEROUS_PATTERNS: &[(&str, &str)] = &[
    (r"rm\s+(-rf|-fr|--recursive)", "Contains recursive delete (rm -rf)"),
    (r"push\s+(?:\S.*)?--force", "Contains force push (--force)"),
    (r"push\s+(?:\S.*)?-f\b", "Contains force push (-f)"),
    (r"reset\s+--hard", "Contains hard reset (reset --hard)"),
    (r"clean\s+(?:\S.*)?-fd", "Contains force clean (clean -fd)"),
    (r"branch\s+(?:\S.*)?-D", "Contains force branch delete (-D)"),
];

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitAlias {
    pub name: String,
    pub command: String,
    pub scope: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub local_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub score: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub warnings: Vec<String>,
    pub errors: Vec<String>,
}

pub struct GitService {
    local_path: Option<String>,
    known_repos_service: KnownReposService,
    ranking_service: RankingService,
}

impl GitService {
    pub fn new() -> Self {
        Self {
            local_path: None,
            known_repos_service: KnownReposService::new(),
            ranking_service: RankingService::new(),
        }
    }

    pub fn set_local_path(&mut self, path: Option<String>) {
        if let Some(ref p) = path {
            self.known_repos_service.add(p);
        }
        self.local_path = path;
    }

    pub fn get_local_path(&self) -> Option<String> {
        self.local_path.clone()
    }

    fn exec_git(&self, args: &[&str], cwd: Option<&str>) -> Result<String, String> {
        let mut cmd = Command::new("git");
        cmd.args(args);
        if let Some(dir) = cwd {
            cmd.current_dir(dir);
        }

        match cmd.output() {
            Ok(output) => {
                if output.status.success() {
                    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
                } else {
                    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                    // git config returns exit code 1 when no aliases exist
                    if output.status.code() == Some(1)
                        && args.contains(&"--get-regexp")
                    {
                        Ok(String::new())
                    } else if stderr.is_empty() {
                        Err(format!("Git command failed with exit code {:?}", output.status.code()))
                    } else {
                        Err(stderr)
                    }
                }
            }
            Err(e) => {
                if e.kind() == std::io::ErrorKind::NotFound {
                    Err("Git is not installed or not found in PATH".to_string())
                } else {
                    Err(e.to_string())
                }
            }
        }
    }

    pub fn get_aliases(&mut self, scope: &str) -> Result<Vec<GitAlias>, String> {
        let mut aliases: Vec<GitAlias> = Vec::new();

        if scope == "global" || scope == "all" {
            match self.exec_git(
                &["config", "--global", "--get-regexp", r"^alias\."],
                None,
            ) {
                Ok(output) => {
                    aliases.extend(Self::parse_alias_output(&output, "global", None));
                }
                Err(_) => {
                    // No global aliases or no global config
                }
            }
        }

        if scope == "local" || scope == "all" {
            let paths_to_scan: Vec<String> = if scope == "all" || self.local_path.is_none() {
                self.known_repos_service.get_all()
            } else {
                self.local_path.iter().cloned().collect()
            };

            for scan_path in &paths_to_scan {
                match self.exec_git(
                    &["config", "--local", "--get-regexp", r"^alias\."],
                    Some(scan_path),
                ) {
                    Ok(output) => {
                        aliases.extend(Self::parse_alias_output(
                            &output,
                            "local",
                            Some(scan_path.clone()),
                        ));
                    }
                    Err(_) => {
                        // Ignore errors for individual paths
                    }
                }
            }
        }

        // Sort alphabetically
        aliases.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

        // Rank aliases based on telemetry history
        if let Ok(scores) = self.ranking_service.get_scores(&aliases) {
            for alias in &mut aliases {
                alias.score = Some(*scores.get(&alias.name).unwrap_or(&0.0));
            }
        }

        Ok(aliases)
    }

    fn parse_alias_output(
        output: &str,
        scope: &str,
        local_path: Option<String>,
    ) -> Vec<GitAlias> {
        if output.is_empty() {
            return Vec::new();
        }

        output
            .lines()
            .filter(|line| !line.is_empty())
            .filter_map(|line| {
                let first_space = line.find(' ')?;
                let key = &line[..first_space];
                let command = &line[first_space + 1..];
                let name = key.strip_prefix("alias.").unwrap_or(key);

                Some(GitAlias {
                    name: name.to_string(),
                    command: command.to_string(),
                    scope: scope.to_string(),
                    local_path: local_path.clone(),
                    score: None,
                })
            })
            .collect()
    }

    pub fn add_alias(
        &mut self,
        name: &str,
        command: &str,
        scope: &str,
        local_path: Option<&str>,
    ) -> Result<(), String> {
        // Check if alias already exists
        let existing = self.get_aliases(scope)?;
        if existing.iter().any(|a| a.name == name) {
            return Err(format!(
                "Alias \"{}\" already exists in {} config",
                name, scope
            ));
        }

        let target_path = if scope == "local" {
            local_path
                .map(|s| s.to_string())
                .or_else(|| self.local_path.clone())
        } else {
            None
        };

        self.exec_git(
            &["config", &format!("--{}", scope), &format!("alias.{}", name), command],
            target_path.as_deref(),
        )?;

        Ok(())
    }

    pub fn update_alias(
        &mut self,
        old_name: &str,
        name: &str,
        command: &str,
        scope: &str,
        local_path: Option<&str>,
    ) -> Result<(), String> {
        let target_path = if scope == "local" {
            local_path
                .map(|s| s.to_string())
                .or_else(|| self.local_path.clone())
        } else {
            None
        };

        // If name changed, delete old one first
        if old_name != name {
            let _ = self.exec_git(
                &[
                    "config",
                    &format!("--{}", scope),
                    "--unset",
                    &format!("alias.{}", old_name),
                ],
                target_path.as_deref(),
            );
        }

        self.exec_git(
            &["config", &format!("--{}", scope), &format!("alias.{}", name), command],
            target_path.as_deref(),
        )?;

        Ok(())
    }

    pub fn delete_alias(
        &mut self,
        name: &str,
        scope: &str,
        local_path: Option<&str>,
    ) -> Result<(), String> {
        let target_path = if scope == "local" {
            local_path
                .map(|s| s.to_string())
                .or_else(|| self.local_path.clone())
        } else {
            None
        };

        self.exec_git(
            &[
                "config",
                &format!("--{}", scope),
                "--unset",
                &format!("alias.{}", name),
            ],
            target_path.as_deref(),
        )?;

        Ok(())
    }

    pub fn validate_command(&self, command: &str) -> ValidationResult {
        let mut warnings = Vec::new();
        let mut errors = Vec::new();

        if command.trim().is_empty() {
            errors.push("Command cannot be empty".to_string());
            return ValidationResult {
                valid: false,
                warnings,
                errors,
            };
        }

        // Check for dangerous patterns
        for (pattern, message) in DANGEROUS_PATTERNS {
            if let Ok(re) = regex_lite::Regex::new(pattern) {
                if re.is_match(command) {
                    warnings.push(message.to_string());
                }
            }
        }

        // Check for shell commands (starting with !)
        if command.starts_with('!') {
            warnings.push(
                "This is a shell command alias (starts with !). Use with caution.".to_string(),
            );
        }

        ValidationResult {
            valid: errors.is_empty(),
            warnings,
            errors,
        }
    }
}
