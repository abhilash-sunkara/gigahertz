import { useState } from "react";
/* import { invoke } from "@tauri-apps/api/core"; */
import "./globals.css";
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

import {info, error} from '@tauri-apps/plugin-log'

import { MdCropDin,  MdExpandMore, MdOutlineClose } from "react-icons/md";


const OverLayBar = () =>  {
    const [maximized, setMaximized] = useState(false);

    let def_size = new LogicalSize(800, 600);

    const resizeWindow = async () => {
    /* info('Clicked!'); */
    if(!maximized){
        setMaximized(true);
        try {
        await getCurrentWindow().maximize();  // Close the window
        } catch (e) {
        /* console.error("Raw error object:", e); */
        error('Error closing window: ' + JSON.stringify(e));
        }
    } else {
        setMaximized(false);
        try {
        await getCurrentWindow().setSize(def_size);  // Close the window
        } catch (e) {
        /* console.error("Raw error object:", e); */
        error('Error closing window: ' + JSON.stringify(e));
        }
    }
    
    };

    const closeWindow = async () => {
    info('Clicked!');
    try {
        await getCurrentWindow().close();  // Close the window
    } catch (e) {
        /* console.error("Raw error object:", e); */
        error('Error closing window: ' + JSON.stringify(e));
    }
    };

    const minimizeWindow = async () => {
    info('Clicked!');
    try {
        await getCurrentWindow().minimize();  // Close the window
    } catch (e) {
        /* console.error("Raw error object:", e); */
        error('Error closing window: ' + JSON.stringify(e));
    }
    };
    return (
    <div className = "bg-zinc-900 h-[4%] flex items-center justify-start p-0.5 pl-2 ">
        <h1 className = "text-l font-sans mr-4">GigaHertz</h1>
        <div className="w-full flex justify-end" data-tauri-drag-region>
            <div
            className="w-8 h-8 mx-1  text-violet-300 hover:text-violet-500"
            onClick={() => {minimizeWindow()}}
            >
            <MdExpandMore size = {32} />
            </div>  
            <div
            className="w-8 h-8 mx-1  text-violet-300 hover:text-violet-500"
            onClick={() => {resizeWindow()}}
            >
            <MdCropDin size = {32}/>
            </div>

            <div
            className="w-8 h-8 mx-1  text-violet-300 hover:text-violet-500"
            onClick={() => {closeWindow()}}
            >
            <MdOutlineClose size = {32}/>
            </div>
        </div>
    </div>
    )
}

export default OverLayBar;