import {  useEffect, useState } from "react";
import "./App.css";
import FileExplorer from "./components/file-explorer";
import { useFileContext } from "./components/file-explorer";
import { invoke } from "@tauri-apps/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderTree } from "@fortawesome/free-solid-svg-icons";





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
    const newCols = (Math.floor(window.innerWidth / 6)) - 60; // Ajustez selon vos besoins
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


  const autoCloseBrackets = async (key: string) => {
    if (['(', '{', '['].includes(key)) {
      try {
          const updatedContent = await invoke<String>("auto_close_brackets", { input: fileContent });
          console.log("Updated content from Rust:", updatedContent);
          setFileContent(String(updatedContent));
      } catch (error) {
          console.error("Error auto-closing brackets:", error);
      }
    }
};

  
  
  const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
  
      const { selectionStart, selectionEnd } = e.currentTarget;
      const currentContent = fileContent;
  
      // Obtenez la partie du texte avant et après la sélection
      const beforeSelection = currentContent.substring(0, selectionStart);
      const selectedText = currentContent.substring(selectionStart, selectionEnd);
      const afterSelection = currentContent.substring(selectionEnd);
  
      // Ajoutez une tabulation au début de chaque ligne sélectionnée
      const indentedText = selectedText.replace(/^/gm, "\t");
  
      // Mettez à jour le contenu du fichier avec le texte modifié
      const newContent = beforeSelection + indentedText + afterSelection;
      setFileContent(newContent);
  
      // Mettez à jour l'affichage du texte dans la zone de texte
      e.currentTarget.value = newContent;
    }else if (e.key === '(' || e.key === '[' || e.key === '{') {
      autoCloseBrackets(e.key);
    }
  };


  useEffect(() => {
    autoCloseBrackets('');
  }, [fileContent]);
  
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
            <FontAwesomeIcon icon={faFolderTree} color="white" className="icons" />
          </div>
          <div className={isClicked ? "file-container" : "file-container-hidden"}>
            <FileExplorer />
          </div>
          <div className="toolbars-button seconds" onClick={handleClick}></div>
        </div>
        <div className="text">
          <div className="line-numbers">
              {fileContent.split('\n').map((_, index) => (
                <div key={index + 1} className="line-number">
                  {index + 1}
                </div>
              ))}
            </div>
          <textarea className="area" id="" cols={textareaCols} rows={150} value={fileContent} onChange={(e) => setFileContent(e.target.value)} onKeyDown={handleTabKey}></textarea>
        </div>
      </div>
    </div>
  );
}


export default App;
