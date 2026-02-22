use std::path::Path;

use serde::{Deserialize, Serialize};
use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::file_service::FileService;
use crate::git_service::{GitAlias, ValidationResult};
use crate::AppState;

/// Standard IPC result returned by all Tauri commands.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IpcResult<T: Serialize> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl<T: Serialize> IpcResult<T> {
    fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    fn err(msg: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(msg),
        }
    }
}

// ── Alias CRUD ──────────────────────────────────────────────

#[tauri::command]
pub fn get_aliases(state: State<'_, AppState>, scope: String) -> IpcResult<Vec<GitAlias>> {
    let mut git = state.git_service.write().unwrap();
    match git.get_aliases(&scope) {
        Ok(aliases) => IpcResult::ok(aliases),
        Err(e) => IpcResult::err(e),
    }
}

#[tauri::command]
pub fn add_alias(
    state: State<'_, AppState>,
    name: String,
    command: String,
    scope: String,
    local_path: Option<String>,
) -> IpcResult<bool> {
    let mut git = state.git_service.write().unwrap();
    match git.add_alias(&name, &command, &scope, local_path.as_deref()) {
        Ok(()) => IpcResult::ok(true),
        Err(e) => IpcResult::err(e),
    }
}

#[tauri::command]
pub fn update_alias(
    state: State<'_, AppState>,
    old_name: String,
    name: String,
    command: String,
    scope: String,
    local_path: Option<String>,
) -> IpcResult<bool> {
    let mut git = state.git_service.write().unwrap();
    match git.update_alias(&old_name, &name, &command, &scope, local_path.as_deref()) {
        Ok(()) => IpcResult::ok(true),
        Err(e) => IpcResult::err(e),
    }
}

#[tauri::command]
pub fn delete_alias(
    state: State<'_, AppState>,
    name: String,
    scope: String,
    local_path: Option<String>,
) -> IpcResult<bool> {
    let mut git = state.git_service.write().unwrap();
    match git.delete_alias(&name, &scope, local_path.as_deref()) {
        Ok(()) => IpcResult::ok(true),
        Err(e) => IpcResult::err(e),
    }
}

// ── Validation ──────────────────────────────────────────────

#[tauri::command]
pub fn validate_command(
    state: State<'_, AppState>,
    command: String,
) -> IpcResult<ValidationResult> {
    let git = state.git_service.read().unwrap();
    IpcResult::ok(git.validate_command(&command))
}

// ── Local Scope Folder Selection ─────────────────────────────

#[tauri::command]
pub async fn select_folder(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<IpcResult<String>, String> {


    let file_path = app
        .dialog()
        .file()
        .set_title("Select Git Repository")
        .blocking_pick_folder();

    match file_path {
        Some(path) => {
            let path_str = path.into_path().map(|p| p.to_string_lossy().to_string()).unwrap_or_default();
            let mut git = state.git_service.write().unwrap();
            git.set_local_path(Some(path_str.clone()));
            Ok(IpcResult::ok(path_str))
        }
        None => {
            let git = state.git_service.read().unwrap();
            let current = git.get_local_path().unwrap_or_default();
            Ok(IpcResult::ok(current))
        }
    }
}

#[tauri::command]
pub fn get_local_path(state: State<'_, AppState>) -> IpcResult<String> {
    let git = state.git_service.read().unwrap();
    IpcResult::ok(git.get_local_path().unwrap_or_default())
}

#[tauri::command]
pub fn set_local_path(
    state: State<'_, AppState>,
    path: String,
) -> IpcResult<String> {
    if !path.is_empty() && !Path::new(&path).exists() {
        return IpcResult::err(format!("Directory does not exist: {}", path));
    }
    let mut git = state.git_service.write().unwrap();
    git.set_local_path(if path.is_empty() { None } else { Some(path.clone()) });
    IpcResult::ok(path)
}

// ── Import / Export ─────────────────────────────────────────

#[tauri::command]
pub async fn export_aliases(
    app: tauri::AppHandle,
    aliases: Vec<GitAlias>,
) -> Result<IpcResult<String>, String> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let default_name = format!("gam-{}.json", now);

    let file_path = app
        .dialog()
        .file()
        .set_title("Export Git Aliases")
        .add_filter("JSON Files", &["json"])
        .add_filter("All Files", &["*"])
        .set_file_name(&default_name)
        .blocking_save_file();

    match file_path {
        Some(path) => {
            let path_str = path.into_path().map(|p| p.to_string_lossy().to_string()).unwrap_or_default();
            match FileService::export_aliases(&aliases, &path_str) {
                Ok(p) => Ok(IpcResult::ok(p)),
                Err(e) => Ok(IpcResult::err(e)),
            }
        }
        None => Ok(IpcResult::err("Export cancelled".to_string())),
    }
}

#[tauri::command]
pub async fn import_aliases(
    app: tauri::AppHandle,
) -> Result<IpcResult<Vec<GitAlias>>, String> {
    let file_path = app
        .dialog()
        .file()
        .set_title("Import Git Aliases")
        .add_filter("JSON Files", &["json"])
        .add_filter("All Files", &["*"])
        .blocking_pick_file();

    match file_path {
        Some(path) => {
            let path_str = path.into_path().map(|p| p.to_string_lossy().to_string()).unwrap_or_default();
            match FileService::import_aliases(&path_str) {
                Ok(aliases) => Ok(IpcResult::ok(aliases)),
                Err(e) => Ok(IpcResult::err(e)),
            }
        }
        None => Ok(IpcResult::err("Import cancelled".to_string())),
    }
}

// ── Open folder / URL ──────────────────────────────────────

#[tauri::command]
pub fn open_local_folder(path: String) -> IpcResult<bool> {
    match open::that(&path) {
        Ok(()) => IpcResult::ok(true),
        Err(e) => IpcResult::err(format!("Failed to open folder: {}", e)),
    }
}

#[tauri::command]
pub fn open_external(url: String) -> IpcResult<bool> {
    match open::that(&url) {
        Ok(()) => IpcResult::ok(true),
        Err(e) => IpcResult::err(format!("Failed to open URL: {}", e)),
    }
}
