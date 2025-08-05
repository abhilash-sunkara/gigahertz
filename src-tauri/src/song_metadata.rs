use std::fs::File;
use std::io::BufReader;
use std::io::Write;
use serde::Serialize;
use serde::Deserialize;


#[derive(Serialize, Deserialize)]
pub struct SongMetadata{
    path : String,
    name : String, 
    artist : String,
    genre : String
}

#[tauri::command]
pub fn get_song_metadata(path: String) -> SongMetadata{
    let f = File::open(path).unwrap();
    let r = BufReader::new(f);
    let p: SongMetadata = serde_json::from_reader(r).unwrap();
    return p;
}

#[tauri::command]
pub fn create_song_metadata_file(path: String, sm: SongMetadata) {
    let json_string = serde_json::to_string_pretty(&sm).unwrap();

    let mut file = File::create(path).unwrap();
    file.write_all(json_string.as_bytes()).unwrap();
}