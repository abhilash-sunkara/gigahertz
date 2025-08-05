type InputProps = {
    setSongName : React.Dispatch<React.SetStateAction<string>>,
    setSongPath : React.Dispatch<React.SetStateAction<string>>,
    setSongArtist : React.Dispatch<React.SetStateAction<string>>,
    setSongGenre : React.Dispatch<React.SetStateAction<string>>,
    songPathMetadata: string,
    createGHSFile: () => void
}

export function SongInfoWindow({setSongName, setSongArtist, setSongPath, setSongGenre, songPathMetadata, createGHSFile}:InputProps) {

    return (
        <div className="h-full bg-violet-200 flex flex-col px-8 justify-start pt-8 items-start">
            <div className = "w-full bg-violet-300 flex flex-row items-center justify-start py-4 mb-4 rounded-md">
                <div className="mx-8 text-zinc-950 text-lg">Song Name : </div>
                <input placeholder="" 
                       name = {"Song Name"} 
                       className="transition-all duration-300 ease-in-out p-3 rounded-md focus-within:rounded-2xl" 
                       onChange={(e) => setSongName(e.currentTarget.value)}
                       
                />
            </div>
            <div className = "w-full bg-violet-300 flex flex-row items-center justify-start py-4 mb-4 rounded-md">
                <div className="mx-8 text-zinc-950 text-lg">Song Path : </div>
                <input placeholder="" 
                       name = {"Song Path"} 
                       className="transition-all duration-300 ease-in-out p-3 rounded-md focus-within:rounded-2xl" 
                       onChange={(e) => setSongPath(e.currentTarget.value)}
                       value = {songPathMetadata}
                />
            </div>
            <div className = "w-full bg-violet-300 flex flex-row items-center justify-start py-4 mb-4 rounded-md">
                <div className="mx-8 text-zinc-950 text-lg">Song Artist : </div>
                <input placeholder="" 
                       name = {"Song Artist"} 
                       className="transition-all duration-300 ease-in-out p-3 rounded-md focus-within:rounded-2xl" 
                       onChange={(e) => setSongArtist(e.currentTarget.value)}
                />
            </div>
            <div className = "w-full bg-violet-300 flex flex-row items-center justify-start py-4 mb-4 rounded-md">
                <div className="mx-8 text-zinc-950 text-lg">Song Genre : </div>
                <input placeholder="" 
                       name = {"Song Genre"} 
                       className="transition-all duration-300 ease-in-out p-3 rounded-md focus-within:rounded-2xl" 
                       onChange={(e) => setSongGenre(e.currentTarget.value)}
                />
            </div>
            <div className = "transition-all duration-300 ease-in-out w-full bg-violet-400 flex flex-row items-center justify-center py-4 mb-4 rounded-md text-zinc-950 text-2xl hover:bg-zinc-900 hover:text-zinc-200 hover:rounded-lg" onClick = {createGHSFile}>
                Build .ghs File 
            </div>
        </div>
    )
}