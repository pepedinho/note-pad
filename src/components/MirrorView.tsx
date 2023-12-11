import React, { useEffect, useRef } from 'react';

interface MirrorViewProps {
  content: string;
}

const MirrorView: React.FC<MirrorViewProps> = ({ content }) => {
  const mirrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mirrorRef.current) {
      mirrorRef.current.textContent = content;
    }
  }, [content]);

  return (
    <div className="mirror-container">
        <div className="mirror-view" ref={mirrorRef}>
            {content}
        </div>
    </div>
    
  );
};

export default MirrorView;