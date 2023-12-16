import { invoke } from "@tauri-apps/api";
import { useState, KeyboardEvent } from "react";



const NewFile = () => {

    const [fileName, setFileName] = useState('')

    const createNewFile =async (fileName: string) => {
        await invoke("open_new_file" ,{fileName});
        console.log(`new file created : ${fileName}`);
    }

    const handleKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            createNewFile(fileName);
        }
    }

    return (
        <div>
            <input type="text" onChange={(e) => setFileName(e.target.value)} onKeyDown={handleKeydown}/>
            <button onClick={() => createNewFile(fileName)}></button>
        </div>
    )
}

export default NewFile;