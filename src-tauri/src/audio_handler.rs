use rodio::{cpal, Device, DeviceTrait, Source};
use rodio::cpal::traits::HostTrait;
use rodio::{OutputStream, Sink, Decoder};
use tauri::{command, Emitter};
use tauri::{State, AppHandle};
use log::info;
use std::sync::Mutex;
use std::fs::File;
use std::time::Duration;
use tauri::Manager;

use crate::source_with_fn::SourceWithFn;


pub struct AudioState(pub Mutex<AudioOutput>);

pub struct AudioOutput {
    pub output_stream: Option<OutputStream>,
    pub device: Option<Device>,
    pub audio_sink: Option<Sink>,
}

impl Default for AudioOutput {
    fn default() -> Self {
        Self {
            device: None,
            audio_sink: None,
            output_stream: None,
        }
    }
}

#[tauri::command]   
pub fn set_audio_sink(state: State<AudioState>) {
    info!("passed through to backend for sink");
    let binding = &mut state.0.lock().unwrap();
    let temp_device = match &binding.device {
        Some(v) => v,
        None => {info!("no device");return}
    };
    let stream_handle: OutputStream = rodio::OutputStreamBuilder::from_device(temp_device.clone()).expect("open default audio stream").open_stream().expect("Output stream not open");
    let sink: Sink = rodio::Sink::connect_new(&stream_handle.mixer());
    binding.audio_sink = Some(sink);
    binding.output_stream = Some(stream_handle);
}

#[tauri::command]
pub fn get_audio_devices() -> Vec<String>{
    let host = cpal::default_host();
    let mut devices = match host.output_devices() {
        Ok(v) => v,
        Err(_e) => return Vec::new(),
    };
    let mut string_collect:Vec<String> = Vec::new();
    for d in devices{
        string_collect.push(d.name().unwrap());
    }

    return string_collect;
}

#[tauri::command]
pub fn set_audio_device(state: State<AudioState>, index: i32) {
    info!("Passed through to backend");
    let host = cpal::default_host();
    let mut devices = match host.output_devices() {
        Ok(v) => v,
        Err(_e) => return,
    };

    let d = devices.nth(index.try_into().unwrap()).expect("device not found at index 0");
    let mut current_state = state.0.lock().unwrap();
    current_state.device = Some(d)
}

#[tauri::command]
pub fn get_song_length(app: tauri::AppHandle, file_path: &str) -> u64 {
    info!("Passed through to backend, attempting to check length of .mp3 file");
    let file = File::open(file_path).unwrap();
    let song = Decoder::try_from(file).unwrap();
    let wrapped_source = SourceWithFn::wrap(song, move || app.emit("audio-ended", ()).unwrap());
    let length = wrapped_source.total_duration().unwrap().as_secs();
    return length;
}

#[tauri::command]
pub fn play_song(app: tauri::AppHandle, file_path: &str, state: State<AudioState>) -> u64 {
    info!("Passed through to backend, attempting to play .mp3 file");
    let file = File::open(file_path).unwrap();
    let song = Decoder::try_from(file).unwrap();
    let wrapped_source = SourceWithFn::wrap(song, move || app.emit("audio-ended", ()).unwrap());
    let length = wrapped_source.total_duration().unwrap().as_secs();
    let binding = state.0.lock().unwrap();
    let sink = binding.audio_sink.as_ref().unwrap();
    sink.append(wrapped_source);
    return length;
}

#[tauri::command]
pub fn skip_song(state: State<AudioState>, num_times: i64) {
    info!("Passed through to backend, attempting to skip .mp3 file");
    let binding = state.0.lock().unwrap();
    let sink = binding.audio_sink.as_ref().unwrap();
    for i in 1..=num_times {
        sink.skip_one();
    }
}

#[tauri::command]
pub fn pause_song(state: State<AudioState>) {
    info!("Passed through to backend, attempting to pause .mp3 file");
    let binding = state.0.lock().unwrap();
    let sink = binding.audio_sink.as_ref().unwrap();
    sink.pause();
}

#[tauri::command]
pub fn unpause_song(state: State<AudioState>) {
    info!("Passed through to backend, attempting to play .mp3 file");
    let binding = state.0.lock().unwrap();
    let sink = binding.audio_sink.as_ref().unwrap();
    sink.play();
}

#[tauri::command]
pub fn set_volume(state: State<AudioState>, volume: f32) {
    let binding = state.0.lock().unwrap();
    let sink = binding.audio_sink.as_ref().unwrap();
    sink.set_volume(volume);
}

#[tauri::command]
pub fn seek_in_music(state: State<AudioState>, position : u64){
    let binding = state.0.lock().unwrap();
    let sink = binding.audio_sink.as_ref().unwrap();
    match sink.try_seek(Duration::new(position, 0)) {
        Ok(_) => {},
        Err(e) => info!("{}", e),
    }
}


