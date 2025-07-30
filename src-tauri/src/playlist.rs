use log::info;
use serde::Serialize;
use serde::Deserialize;
use std::fs::File;
use std::io::BufReader;
use std::io::Write;


#[derive(Serialize, Deserialize)]
pub struct PlayList {
    song_paths: Vec<String>
}

#[tauri::command]
pub fn get_playlist(path: String) -> Vec<String>{
    let f = File::open(path).unwrap();
    let r = BufReader::new(f);
    let p: PlayList = serde_json::from_reader(r).unwrap();
    return p.song_paths;
}

#[tauri::command]
pub fn create_playlist(song_paths: Vec<String>, playlist_name: String){
    info!("passed through to backend to create .json playlist named as : {}", playlist_name);
    let new_playlist = PlayList {song_paths : song_paths};
    let json_string = serde_json::to_string_pretty(&new_playlist).unwrap();

    let mut file = File::create(playlist_name).unwrap();
    file.write_all(json_string.as_bytes()).unwrap();
}