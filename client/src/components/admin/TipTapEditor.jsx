import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useCallback, useState } from 'react'
import api from '../../services/api'

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={[
        'px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors duration-100',
        active
          ? 'bg-rojo text-crema'
          : 'text-negro/90 hover:text-negro hover:bg-gris-mid/30',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="w-px h-4 bg-gris-mid mx-0.5 shrink-0" />
}

export default function TipTapEditor({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: {},
        orderedList: {},
        blockquote: {},
        code: {},
        codeBlock: {},
      }),
      Link.configure({ openOnClick: false }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full my-4' } }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[320px] px-5 py-4 font-mono text-[13px] text-negro leading-relaxed',
      },
    },
  })

  const insertImage = useCallback(async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await api.post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const src = UPLOAD_URL + res.data.url
      editor?.chain().focus().setImage({ src }).run()
    } catch {
      // silently ignore upload errors in editor
    } finally {
      setUploading(false)
    }
  }, [editor])

  const applyLink = useCallback(() => {
    if (!linkUrl.trim()) {
      editor?.chain().focus().unsetLink().run()
    } else {
      editor?.chain().focus().setLink({ href: linkUrl.trim() }).run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  if (!editor) return null

  return (
    <div className="border border-gris-mid focus-within:border-rojo/60 transition-colors duration-200 bg-gris">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gris-mid bg-crema/40">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrita"
        >B</ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Cursiva"
        ><em>I</em></ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Título H2"
        >H2</ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Título H3"
        >H3</ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista"
        >— —</ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Cita"
        >"</ToolbarButton>

        <Divider />

        <div className="relative">
          <ToolbarButton
            onClick={() => setShowLinkInput(v => !v)}
            active={editor.isActive('link') || showLinkInput}
            title="Enlace"
          >↗</ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 z-20 mt-1 flex items-center gap-1 bg-crema border border-gris-mid p-1.5 shadow-xl min-w-[240px]">
              <input
                autoFocus
                type="url"
                placeholder="https://"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyLink()}
                className="flex-1 bg-gris text-negro font-mono text-[11px] px-2 py-1 border border-gris-mid focus:outline-none focus:border-rojo"
              />
              <button
                type="button"
                onClick={applyLink}
                className="font-ui text-[10px] uppercase tracking-widest px-2 py-1 bg-rojo text-crema"
              >OK</button>
              <button
                type="button"
                onClick={() => { setShowLinkInput(false); editor.chain().focus().unsetLink().run() }}
                className="font-mono text-[11px] text-negro/90 px-1.5 py-1 hover:text-negro"
              >✕</button>
            </div>
          )}
        </div>

        <label
          title={uploading ? 'Subiendo…' : 'Insertar imagen'}
          className={[
            'px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-widest cursor-pointer transition-colors duration-100',
            uploading ? 'text-rojo cursor-wait' : 'text-negro/90 hover:text-negro hover:bg-gris-mid/30',
          ].join(' ')}
        >
          {uploading ? '…' : '⊞'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={e => insertImage(e.target.files?.[0])}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      <style>{`
        .prose-editor h2 { font-family: 'Rubik Wet Paint', 'Bebas Neue', sans-serif; font-size: 1.6rem; color: #A8161B; margin: 1.2rem 0 0.5rem; letter-spacing: 0.05em; text-transform: uppercase; }
        .prose-editor h3 { font-family: 'Permanent Marker', cursive; font-size: 1.2rem; color: #A8161B; margin: 1rem 0 0.4rem; }
        .prose-editor p { margin: 0.6rem 0; color: #1A1A1A; }
        .prose-editor strong { color: #1A1A1A; }
        .prose-editor em { color: #A8161B; font-style: italic; }
        .prose-editor a { color: #A8161B; text-decoration: underline; text-underline-offset: 2px; }
        .prose-editor blockquote { border-left: 2px solid #A8161B; padding-left: 1rem; margin: 1rem 0; color: #6B6B6B; }
        .prose-editor ul { list-style: none; padding-left: 1rem; }
        .prose-editor ul li::before { content: '—'; margin-right: 0.5rem; color: #A8161B; }
        .prose-editor ol { padding-left: 1.5rem; }
        .prose-editor code { background: #E8E0D5; padding: 0.1rem 0.3rem; font-size: 0.85em; color: #A8161B; }
        .prose-editor pre { background: #E8E0D5; border: 1px solid #C9BFB1; padding: 1rem; overflow-x: auto; margin: 1rem 0; color: #1A1A1A; }
      `}</style>
    </div>
  )
}
