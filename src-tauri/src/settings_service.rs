use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

/// Persists app settings (e.g. theme) to a JSON file in the app data directory.
pub struct SettingsService {
    config_path: PathBuf,
    settings: HashMap<String, String>,
}

impl SettingsService {
    pub fn new() -> Self {
        let config_dir = dirs::data_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("com.github.zintaen.gam");

        if !config_dir.exists() {
            let _ = fs::create_dir_all(&config_dir);
        }

        let config_path = config_dir.join("settings.json");
        let mut service = Self {
            config_path,
            settings: HashMap::new(),
        };
        service.load();
        service
    }

    fn load(&mut self) {
        if let Ok(data) = fs::read_to_string(&self.config_path) {
            if let Ok(map) = serde_json::from_str::<HashMap<String, String>>(&data) {
                self.settings = map;
            }
        }
    }

    fn save(&self) {
        if let Ok(json) = serde_json::to_string_pretty(&self.settings) {
            let _ = fs::write(&self.config_path, json);
        }
    }

    pub fn get(&self, key: &str) -> Option<String> {
        self.settings.get(key).cloned()
    }

    pub fn set(&mut self, key: &str, value: &str) {
        self.settings.insert(key.to_string(), value.to_string());
        self.save();
    }
}
