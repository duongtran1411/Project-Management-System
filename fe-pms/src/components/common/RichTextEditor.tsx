import React from 'react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  theme?: string;
}

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, style, theme = 'snow' }) => {
  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      theme={theme}
      style={style}
    />
  );
};

export default RichTextEditor; 