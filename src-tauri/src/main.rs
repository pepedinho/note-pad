#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{fs::{self, File}, result};
use serde::Serialize;
use std::path::Path;

mod lib;
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

#[derive(serde::Deserialize)]
struct SaveFileParams {
    file_path: String,
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


#[tauri::command]
fn save_file_content(params: SaveFileParams) -> Result<(), String> {
    let SaveFileParams {file_path, content } = params;
    if let Err(e) = fs::write(&file_path, content) {
        return Err(format!("Error saving file content : {}", e));
    }

    Ok(())
}

#[tauri::command]
fn auto_close_brackets(input: String, selection_start: Option<usize>, car: char) -> String {
    lib::auto_close_brackets(&input, selection_start, car)
}

#[tauri::command]
fn open_new_file(file_name: &str) -> Result<(), String> {
    let result = File::create(file_name);

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Error creating file: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()

        .invoke_handler(tauri::generate_handler![
            get_workspace_content,
            get_directory_content,
            get_file_content,
            save_file_content,
            auto_close_brackets,
            open_new_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
