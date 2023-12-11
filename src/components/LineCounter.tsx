import React from "react";

interface LineCountProps {
    content: String;
}

const LineCounter: React.FC<LineCountProps> = ({content}) => {
    const lineCounter = content.split('\n').length;
    return (
        <div className="lines-counter">{lineCounter}</div>
    )
}

export default LineCounter;