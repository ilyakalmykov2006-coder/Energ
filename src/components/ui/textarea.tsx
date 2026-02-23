import * as React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RichTextarea: React.FC<RichTextareaProps> = ({ value, onChange, className }) => {
  return (
    <div className={className}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        className="bg-background rounded-md min-h-[80px]"
      />
    </div>
  );
};

export { RichTextarea };
