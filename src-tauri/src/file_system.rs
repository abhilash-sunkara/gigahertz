use std::path::Path;

#[tauri::command]
pub fn list_files(path: &str) -> Vec<String>{
    let path = Path::new(path);
    path.read_dir()
        .unwrap()
        .map(|entry| entry.unwrap().file_name().to_str().unwrap().to_owned())
        .collect::<Vec<String>>()
}
