import {  useEffect, useRef, useState } from "react";
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getMatchingBracket = (brac: string): string => {
    switch (brac) {
        case '(':
            return ')';
        case '{':
            return '}';
        case '[':
            return ']';
        default:
            return brac;
    }
};

const autoCloseBrackets = async (brac: string) => {
  try {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd } = textarea;
      const cursorPosition = selectionStart !== null ? selectionStart : selectionEnd;

      if (cursorPosition !== null && cursorPosition !== undefined) {
          const textBeforeCursor = fileContent.substring(0, cursorPosition);
          const selectedText = fileContent.substring(selectionStart, selectionEnd);
          const textAfterCursor = fileContent.substring(cursorPosition + (selectionEnd - selectionStart));
          let updatedContent: string;
          let newCursorPosition: number | null = null;

          if (selectedText.length > 0) {
              // Il y a du texte sélectionné, entourer le texte sélectionné avec les crochets appropriés
              updatedContent = textBeforeCursor + brac + selectedText + getMatchingBracket(brac) + textAfterCursor;
              console.log(`textBeforeCursor: ${textBeforeCursor} \n brac${brac} \n selectedText: ${selectedText} \n matchingbrac: ${getMatchingBracket(brac)} \n fileContent.substring(cursorPostion) : ${fileContent.substring(cursorPosition)} \n cursorPosition : ${cursorPosition}`);
              newCursorPosition = cursorPosition + brac.length + selectedText.length + getMatchingBracket(brac).length - 1;
          } else {
              // Aucun texte sélectionné, ajouter simplement les crochets appropriés avant le curseur
              updatedContent = textBeforeCursor + brac + getMatchingBracket(brac) + fileContent.substring(cursorPosition);
              newCursorPosition = cursorPosition + brac.length;
          }

          setFileContent(String(updatedContent));
          

          if (selectedText.length > 0) {
            setTimeout(() => {
              if (newCursorPosition !== null) {
                textarea.setSelectionRange(newCursorPosition + getMatchingBracket(brac).length, newCursorPosition + getMatchingBracket(brac).length, "backward");
              }
            }, 10);
          } else {
            setTimeout(() => {
              if (newCursorPosition !== null) {
                  textarea.setSelectionRange(newCursorPosition , newCursorPosition );
              }
            }, 10);

          }
        
      }
  } catch (error) {
      console.error("Error auto-closing brackets:", error);
  }
};


  
  
const handleTabKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Tab") {
    e.preventDefault();

    const { selectionStart, selectionEnd } = e.currentTarget;
    const currentContent = fileContent;

    // Get the text portion before and after the selection
    const beforeSelection = currentContent.substring(0, selectionStart);
    const selectedText = currentContent.substring(selectionStart, selectionEnd);
    const afterSelection = currentContent.substring(selectionEnd);

    // Add a tab to the beginning of each selected line
    const indentedText = selectedText.replace(/^/gm, "\t");

    // Update the file content with the modified text
    const newContent = beforeSelection + indentedText + afterSelection;
    setFileContent(newContent);

    // Update the text display in the text area
    e.currentTarget.value = newContent;
  }else if (e.key === '(' || e.key === '[' || e.key === '{') {
    e.preventDefault();
    autoCloseBrackets(e.key);
  }
};


  // useEffect(() => {
  //   autoCloseBrackets();
  //   console.log('auto close')
  // }, [fileContent]);
  
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
          <textarea ref={textareaRef} className="area" id="" cols={textareaCols} rows={150} value={fileContent} onChange={(e) => setFileContent(e.target.value)} onKeyDown={handleTabKey}></textarea>
        </div>
      </div>
    </div>
  );
}


export default App;
