use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};

/// Persists known repo paths to a JSON file in the app data directory.
pub struct KnownReposService {
    config_path: PathBuf,
    known_paths: HashSet<String>,
}

impl KnownReposService {
    pub fn new() -> Self {
        let config_dir = dirs::data_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("com.github.zintaen.gam");

        if !config_dir.exists() {
            let _ = fs::create_dir_all(&config_dir);
        }

        let config_path = config_dir.join("known-repos.json");
        let mut service = Self {
            config_path,
            known_paths: HashSet::new(),
        };
        service.load();
        service
    }

    fn load(&mut self) {
        if let Ok(data) = fs::read_to_string(&self.config_path) {
            if let Ok(paths) = serde_json::from_str::<Vec<String>>(&data) {
                // Filter out paths that no longer exist
                self.known_paths = paths
                    .into_iter()
                    .filter(|p| Path::new(p).exists())
                    .collect();
            }
        }
    }

    fn save(&self) {
        let paths: Vec<&String> = self.known_paths.iter().collect();
        if let Ok(json) = serde_json::to_string_pretty(&paths) {
            let _ = fs::write(&self.config_path, json);
        }
    }

    pub fn add(&mut self, repo_path: &str) {
        if self.known_paths.insert(repo_path.to_string()) {
            self.save();
        }
    }

    pub fn get_all(&self) -> Vec<String> {
        self.known_paths.iter().cloned().collect()
    }

    #[allow(dead_code)]
    pub fn remove(&mut self, repo_path: &str) {
        if self.known_paths.remove(repo_path) {
            self.save();
        }
    }
}
