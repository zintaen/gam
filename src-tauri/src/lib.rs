use std::sync::RwLock;

mod commands;
mod file_service;
mod git_service;
mod known_repos_service;
mod ranking_service;
mod settings_service;

pub use commands::*;
pub use git_service::GitService;
pub use known_repos_service::KnownReposService;
pub use ranking_service::RankingService;
pub use settings_service::SettingsService;

/// Shared application state managed by Tauri.
pub struct AppState {
    pub git_service: RwLock<GitService>,
    pub settings_service: RwLock<SettingsService>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Evaluate CLI argument for folder
    let local_path: Option<String> = {
        let args: Vec<String> = std::env::args().skip(1).collect();
        args.iter()
            .find(|a| !a.starts_with('-') && !a.ends_with(".js") && !a.ends_with(".ts") && *a != ".")
            .map(|a| {
                std::path::Path::new(a)
                    .canonicalize()
                    .map(|p| p.to_string_lossy().to_string())
                    .unwrap_or_else(|_| a.clone())
            })
            .or_else(|| {
                args.iter()
                    .find(|a| *a == ".")
                    .map(|_| std::env::current_dir().unwrap().to_string_lossy().to_string())
            })
    };

    let mut git_service = GitService::new();
    if let Some(ref path) = local_path {
        git_service.set_local_path(Some(path.clone()));
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            git_service: RwLock::new(git_service),
            settings_service: RwLock::new(SettingsService::new()),
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_aliases,
            commands::add_alias,
            commands::update_alias,
            commands::delete_alias,
            commands::validate_command,
            commands::export_aliases,
            commands::import_aliases,
            commands::select_folder,
            commands::get_local_path,
            commands::set_local_path,
            commands::open_local_folder,
            commands::open_external,
            commands::get_theme,
            commands::set_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
