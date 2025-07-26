import { invoke } from "@tauri-apps/api/core";
import {info} from '@tauri-apps/plugin-log'

export async function add_sine_to_sink() {
    info("attempting to add sine");
    await invoke("add_sine_to_audio_sink", {});
}

export async function add_saw_to_sink() {
    info("attempting to add saw");
    await invoke("add_saw_to_audio_sink", {});
}

export async function add_square_to_sink() {
    info("attempting to add sqaure");
    await invoke("add_square_to_audio_sink", {});
}

