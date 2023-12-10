
import { createContext ,useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from "react"; 
import { invoke } from "@tauri-apps/api";
import dossier from '../assets/dossiers.png';
import image from '../assets/image.png';
import texte from '../assets/format-de-texte.png';
import crabe from '../assets/rust.png';
import json from '../assets/dossier.png';
import gear from '../assets/Gear-icon.png';
import lock from '../assets/ferme-long-lock.png';
import lines from '../assets/lines.png';
import newFile from '../assets/new_file.png'





interface FileSystemEntry {
    name: string;
    is_directory: boolean;
}
  
interface FileContextProps {
    fileName: string | null;
    isOpen: boolean;
    setFileState: Dispatch<SetStateAction<{ fileName: string | null; isOpen: boolean }>>;
  }
  
  const FileContext = createContext<FileContextProps>({
    fileName: null,
    isOpen: false,
    setFileState: () => {}, // Une fonction vide par défaut, elle sera remplacée lors de l'utilisation du contexte.
  });
  
  export function useFileContext() {
    return useContext(FileContext);
  }
  
  interface FileContextProviderProps {
    children: ReactNode;
  }
  
  export function FileContextProvider({ children }: FileContextProviderProps) {
    const [fileState, setFileState] = useState<{ fileName: string | null; isOpen: boolean }>({
      fileName: null,
      isOpen: false,
    });
  
    return <FileContext.Provider value={{ ...fileState, setFileState }}>{children}</FileContext.Provider>;
  }

function FileExplorer() {

    const [fileList, setFileList] = useState<FileSystemEntry[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: FileSystemEntry[] }>({});
    const { setFileState } = useContext(FileContext);


    useEffect(() => {
        async function fetchWorkspaceContent() {
        try {
            const result = await invoke("get_workspace_content");
            if (Array.isArray(result)) {
            setFileList(result);
            }
        } catch (error) {
            console.error("Error fetching workspace content:", error);
        }
        }

        fetchWorkspaceContent();
    }, []);

    const openFile = (fileName: string, parentFolder: string | null = null) => {
        const fullFileName = parentFolder ? `${parentFolder}/${fileName}` : fileName;
        setFileState({ fileName: fullFileName, isOpen: true });
        console.log(`Opened file: ${fullFileName}`);
      };
    


    const handleFileClick = async (file: FileSystemEntry) => {
        if (file.is_directory) {
        try {
            const folderName = file.name;

            // Créez une copie de l'objet actuel pour pouvoir le modifier
            const newExpandedFolders = { ...expandedFolders };

            // Vérifiez si le dossier est déjà ouvert
            if (newExpandedFolders[folderName]) {
            // Fermez le dossier en retirant son contenu de l'objet
            delete newExpandedFolders[folderName];
            } else {
            // Ouvrez le dossier en ajoutant son contenu à l'objet
            const result = await invoke("get_directory_content", { directory: folderName });
            if (Array.isArray(result)) {
                newExpandedFolders[folderName] = result;
            }
            }

            // Mettez à jour l'objet des dossiers ouverts
            setExpandedFolders(newExpandedFolders);
        } catch (error) {
            console.error(`Error handling click for directory ${file.name}:`, error);
        }
        }
    };

    const getFileExtension = (fileName: string): string | null => {
      const parts = fileName.split('.');

      if (parts.length > 1) {
        return parts[parts.length - 1];
      }
      return null;
    }

    const iconDistrib = (extension: string | null, isDirectory: Boolean) => {
      if (extension === 'png') {
        return image;
      } else if (extension === 'txt') {
        return texte;
      } else if (isDirectory) {
        return dossier;
      } else if (extension === 'rs') {
        return crabe;
      } else if (extension === 'json') {
        return json;
      } else if (extension === 'toml') {
        return gear;
      } else if (extension === 'lock') {
        return lock;
      }
      else {
        return null;
      }
    }


    return (
        <div className="file-explorer">
          <div className="header">
            <p>src-tauri</p>
            <img className="file-icons" src={newFile} alt="" />
          </div>
              {fileList.map((file, index) => (
                <div key={index} className="file-name" onClick={file.is_directory ?  () => handleFileClick(file) : () =>  openFile(file.name) }>
                  <div className="file-name-inline">
                    <img className="file-icons" src={iconDistrib(getFileExtension(file.name), file.is_directory)! ?? lines} alt="" />
                   <p className="para">{file.name}</p>
                  </div>
                  {file.is_directory && (
                  <div style={{ display: expandedFolders[file.name] ? '' : 'none' }}>
                    {expandedFolders[file.name] &&
                      expandedFolders[file.name].map((innerFile, innerIndex) => (
                        <div key={innerIndex} className="unwrapped-file-name" onClick={ innerFile.is_directory ? () => handleFileClick(innerFile) : () => openFile(innerFile.name, file.name)}>
                            <img className="file-icons" src={iconDistrib(getFileExtension(innerFile?.name), innerFile?.is_directory)! ?? lines}></img>
                          <p className="para" >{innerFile.name}</p>
                        </div>
                      ))}
                  </div>
                )}
                </div>
              ))}
            </div>
    )
}

export default FileExplorer;