
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_log::{Target, TargetKind};

pub mod audio_handler;
pub mod file_system;
pub mod source_with_fn;
pub mod playlist;


use audio_handler::set_audio_sink;
use audio_handler::set_audio_device;
use audio_handler::play_song;
use audio_handler::pause_song;
use audio_handler::unpause_song;
use audio_handler::skip_song;
use audio_handler::get_audio_devices;
use audio_handler::get_song_length;
use audio_handler::set_volume;
use audio_handler::seek_in_music;
use audio_handler::AudioState;

use file_system::list_files;

use playlist::get_playlist;
use playlist::create_playlist;


use std::sync::Mutex;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AudioState(Mutex::new(audio_handler::AudioOutput::default())))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir { file_name: None }),
            Target::new(TargetKind::Webview),
        ]).build())
        .invoke_handler(tauri::generate_handler![
            get_audio_devices,
            set_audio_sink,
            set_audio_device,
            list_files,
            play_song,
            pause_song,
            unpause_song,
            skip_song,
            get_playlist,
            get_song_length,
            create_playlist,
            set_volume,
            seek_in_music
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/* #[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
} */

/* #[tauri::command]
fn add_sine_to_audio_sink(state: State<AudioState>) {
    info!("Passed through to backend");
    let current_audio_state = state.0.lock().unwrap();
    match &current_audio_state.audio_sink {
        Some(v) => {
            info!("sink exists");
            let source = SineWave::new(440.0).take_duration(Duration::from_secs_f32(2.0)).amplify(1.2);
            v.append(source);
        },
        None => {info!("sink doesn't exist");return}
    }
}

#[tauri::command]
fn add_saw_to_audio_sink(state: State<AudioState>) {
    info!("Passed through to backend");
    let current_audio_state = state.0.lock().unwrap();
    match &current_audio_state.audio_sink {
        Some(v) => {
            info!("sink exists");
            let source = SawtoothWave::new(440.0).take_duration(Duration::from_secs_f32(2.0)).amplify(1.2);
            v.append(source);
        },
        None => {info!("sink doesn't exist");return}
    }
}

#[tauri::command]
fn add_square_to_audio_sink(state: State<AudioState>) {
    info!("Passed through to backend");
    let current_audio_state = state.0.lock().unwrap();
    match &current_audio_state.audio_sink {
        Some(v) => {
            info!("sink exists");
            let source = SquareWave::new(440.0).take_duration(Duration::from_secs_f32(2.0)).amplify(1.2);
            v.append(source);
        },
        None => {info!("sink doesn't exist");return}
    }
}
 */



/* #[tauri::command]

fn get_audio_device_name_at_0() -> String {
    info!("The name param is");
    let host = cpal::default_host();
    let mut devices = match host.output_devices() {
        Ok(v) => v,
        Err(_e) => return "".to_string(),
    };
    let d = devices.nth(0).expect("device not found at index 0");
    return match d.name() {
        Ok(s) => s,
        Err(_e) => return "".to_string()
    };
} */

/* #[tauri::command]
fn get_audio_device(state: State<AudioState>) -> String {
    info!("Passed through to backend");
    let current_audio_state = state.0.lock().unwrap();
    return match &current_audio_state.device {
        Some(v) => return match v.name() {
            Ok(s) => s,
            Err(_e) => "".to_string()
        },
        None => "".to_string()
    }
} */




