import {  useEffect, useState } from "react";
import "./App.css";
import FileExplorer from "./components/file-explorer";
import { useFileContext } from "./components/file-explorer";
import { invoke } from "@tauri-apps/api";
import papier from './assets/papier.png';




function App() {
  const [isClicked, setIsClicked] = useState(false);
  const { fileName, isOpen } = useFileContext(); 
  const [fileContent, setFileContent] = useState("");
  const [textareaCols, setTextareaCols] = useState(50);

  const handleClick = () =>{
    setIsClicked(!isClicked);
  }

  const fetchFileContent = async () => {
    if (isOpen && fileName) {
      try {
        const content = await invoke<{content: string}>("get_file_content", {filePath: fileName});
        setFileContent(content?.content || "");
        console.log(`Opened file: ${fileName}`);
        console.log(fileContent);

      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    }
  }

  useEffect(() => {
    fetchFileContent();
    console.log(isOpen);
  }, [fileName, isOpen]);

  const handleResizeOff = () => {
    // Mise à jour du nombre de colonnes en fonction de la largeur de la fenêtre
    const newCols = Math.floor(window.innerWidth / 7.8); // Ajustez selon vos besoins
    setTextareaCols(newCols);
  };

  const handleResizeOn = () => {
    // Mise à jour du nombre de colonnes en fonction de la largeur de la fenêtre
    const newCols = (Math.floor(window.innerWidth / 6)) - 63; // Ajustez selon vos besoins
    setTextareaCols(newCols);
  };

  useEffect(() => {
    // Gestionnaire d'événement de redimensionnement de la fenêtre
    window.addEventListener("resize",isClicked ? handleResizeOn : handleResizeOff);

    // Nettoyage du gestionnaire d'événement lors du démontage du composant
    return () => {
      window.removeEventListener("resize", isClicked ? handleResizeOn : handleResizeOff);
    };
  }); 

  useEffect(() => {
    isClicked ? handleResizeOn() : handleResizeOff();
    console.log('resize')
  }, [isClicked]);


  const handleSave = async () => {
    if (isOpen && fileName) {
      try {
        await invoke("save_file_content", { params: { file_path: fileName, content: fileContent } });
        console.log(`saved file ${fileName}`);
      } catch (error) {
        console.error("error saving file content:", error);
      }
    }
  }



  const handleSaveShortcut = (e: KeyboardEvent) => {
    if ((e.metaKey ||e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleSaveShortcut);

    return () => {
      window.removeEventListener("keydown", handleSaveShortcut);
    }
  })


  return (
    <div className="container">
      <div className="page">
        <div className={isClicked ? 'toolbars' : 'toolbars-hidden'}>
          <div className="toolbars-button first" onClick={handleClick}>
            <img src={papier} alt="file" className="icons" />
          </div>
          <div className={isClicked ? "file-container" : "file-container-hidden"}>
            <FileExplorer />
          </div>
          <div className="toolbars-button seconds" onClick={handleClick}></div>
        </div>
        <div className="text">
          <textarea className="area" id="" cols={textareaCols} rows={150} value={fileContent} onChange={(e) => setFileContent(e.target.value)}></textarea>
        </div>
      </div>
    </div>
  );
}


export default App;
