#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::fs;
use serde::Serialize;
use std::path::Path;
// Prevents additional console window on Windows in release, DO NOT REMOVE!!

//use std::fmt::format;

#[derive(Debug, serde::Deserialize, Serialize)]
struct FileSystemEntry{
    name: String,
    is_directory: bool,
}

#[derive(Debug, serde::Deserialize, Serialize)]
struct FileContent{
    name: String,
    content: String,
}


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_workspace_content() -> Vec<FileSystemEntry> {
    if let Ok(entries) = fs::read_dir(".") {
        let files: Vec<FileSystemEntry> = entries
        .filter_map(|entry| {
            if let Ok(entry) = entry {
                let path = entry.path();
                Some(FileSystemEntry {
                    name: entry.file_name().to_string_lossy().into_owned(),
                    is_directory: path.is_dir(),
                })
            } else {
                None
            }
        })
        .collect();


    return  files;
    }

    Vec::new()
}

#[tauri::command]
fn get_directory_content(directory: &str) -> Vec<FileSystemEntry> {

    if let Ok(entries) = fs::read_dir(directory) {
        let files: Vec<FileSystemEntry> = entries
            .filter_map(|entry| {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    Some(FileSystemEntry {
                        name: entry.file_name().to_string_lossy().into_owned(),
                        is_directory: path.is_dir(),
                    })
                } else {
                    None
                }
            })
            .collect();

        return files;
    }
    

    Vec::new()
}

#[tauri::command]
fn get_file_content(file_path: &str) -> Option<FileContent> {
    if let Ok(content) = fs::read_to_string(file_path) {
        let path = Path::new(file_path);

        // Obtenez le chemin du dossier parent
        let parent_folder = path.parent().and_then(Path::file_name).unwrap_or_default().to_string_lossy().into_owned();
    
        // Obtenez le nom du fichier
        let file_name = path.file_name()?.to_string_lossy().into_owned();

        Some(FileContent { 
            name: file_name,
            content,
        })
    } else {
        None
    }
}

fn main() {
    tauri::Builder::default()

        .invoke_handler(tauri::generate_handler![
            get_workspace_content,
            get_directory_content,
            get_file_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}