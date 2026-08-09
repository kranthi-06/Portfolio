import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Strikethrough, List, ListOrdered, Link as LinkIcon, Quote, Heading2, Code, RotateCcw, RotateCw } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--admin-line)] bg-[var(--admin-bg-subtle)] rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('bold') ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('italic') ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('strike') ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>

      <div className="w-[1px] h-4 bg-[var(--admin-line)] mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Heading"
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('bulletList') ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('orderedList') ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-[1px] h-4 bg-[var(--admin-line)] mx-1" />

      <button
        onClick={setLink}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('link') ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('blockquote') ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Quote"
      >
        <Quote size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded hover:bg-[var(--admin-glass)] transition-colors ${editor.isActive('codeBlock') ? 'bg-[var(--admin-glass)] text-[var(--admin-accent)]' : 'text-[var(--admin-ink-secondary)]'}`}
        type="button"
        title="Code Block"
      >
        <Code size={16} />
      </button>

      <div className="w-[1px] h-4 bg-[var(--admin-line)] mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded hover:bg-[var(--admin-glass)] text-[var(--admin-ink-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        type="button"
        title="Undo"
      >
        <RotateCcw size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded hover:bg-[var(--admin-glass)] text-[var(--admin-ink-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        type="button"
        title="Redo"
      >
        <RotateCw size={16} />
      </button>
    </div>
  );
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--admin-accent)] underline underline-offset-2',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none min-h-[150px] p-4 focus:outline-none focus:ring-0',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Re-sync value if it changes externally (e.g. initial load or clearing form)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="border border-[var(--admin-line)] rounded-xl overflow-hidden bg-[var(--admin-bg)] transition-colors focus-within:border-[var(--admin-accent)] focus-within:ring-1 focus-within:ring-[var(--admin-accent)]/20">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      
      {/* Tiptap styles to ensure it looks good without Tailwind Typography plugin if missing */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ProseMirror p { margin-top: 0; margin-bottom: 0.75em; line-height: 1.6; color: var(--admin-ink-secondary); }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; color: var(--admin-ink); }
        .ProseMirror ul { padding-left: 1.5em; margin-top: 0; margin-bottom: 0.75em; list-style-type: disc; color: var(--admin-ink-secondary); }
        .ProseMirror ol { padding-left: 1.5em; margin-top: 0; margin-bottom: 0.75em; list-style-type: decimal; color: var(--admin-ink-secondary); }
        .ProseMirror li { margin-bottom: 0.25em; }
        .ProseMirror blockquote { border-left: 3px solid var(--admin-accent); padding-left: 1em; margin-left: 0; margin-right: 0; font-style: italic; color: var(--admin-ink-muted); }
        .ProseMirror pre { background: var(--admin-bg-subtle); border: 1px solid var(--admin-line); border-radius: 0.5rem; padding: 0.75rem; margin-top: 0; margin-bottom: 0.75em; overflow-x: auto; color: var(--admin-ink-secondary); font-family: monospace; font-size: 0.875rem; }
        .ProseMirror code { font-family: monospace; }
        .ProseMirror strong { font-weight: 600; color: var(--admin-ink); }
        .ProseMirror em { font-style: italic; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--admin-ink-muted);
          pointer-events: none;
          height: 0;
        }
      `}} />
    </div>
  );
}
