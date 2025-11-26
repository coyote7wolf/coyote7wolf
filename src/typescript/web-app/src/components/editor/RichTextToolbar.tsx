/**
 * Rich Text Formatting Toolbar
 * Advanced formatting controls for the document editor
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Formatting Icons (simplified SVG icons)
const FormatBoldIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
    />
  </svg>
)

const FormatItalicIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 4l4 16M6 8h12M4 16h12"
    />
  </svg>
)

const FormatUnderlineIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 4v8a5 5 0 0010 0V4"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 20h14"
    />
  </svg>
)

const FormatListIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
)

const FormatNumberedListIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 8V6a2 2 0 00-2-2h-2M16 16v2a2 2 0 01-2 2h-2"
    />
  </svg>
)

const FormatQuoteIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const FormatCodeIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
)

const FormatLinkIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
)

const FormatImageIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const FormatTableIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1z"
    />
  </svg>
)

export interface FormattingState {
  bold: boolean
  italic: boolean
  underline: boolean
  fontSize: number
  fontFamily: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  listType: 'none' | 'bullet' | 'numbered'
}

export interface RichTextToolbarProps {
  formatting: FormattingState
  onFormatChange: (property: keyof FormattingState, value: any) => void
  onInsertLink: () => void
  onInsertImage: () => void
  onInsertTable: () => void
  onInsertCode: () => void
  onInsertQuote: () => void
  disabled?: boolean
}

export function RichTextToolbar({
  formatting,
  onFormatChange,
  onInsertLink,
  onInsertImage,
  onInsertTable,
  onInsertCode,
  onInsertQuote,
  disabled = false,
}: RichTextToolbarProps) {
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [showSizeMenu, setShowSizeMenu] = useState(false)

  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Monaco', value: 'Monaco, monospace' },
  ]

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64]

  const handleToggleFormat = useCallback(
    (property: keyof FormattingState) => {
      if (
        property === 'bold' ||
        property === 'italic' ||
        property === 'underline'
      ) {
        onFormatChange(property, !formatting[property])
      }
    },
    [formatting, onFormatChange]
  )

  const handleTextAlign = useCallback(
    (align: 'left' | 'center' | 'right' | 'justify') => {
      onFormatChange('textAlign', align)
    },
    [onFormatChange]
  )

  const handleListType = useCallback(
    (listType: 'none' | 'bullet' | 'numbered') => {
      onFormatChange('listType', listType)
    },
    [onFormatChange]
  )

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Main Toolbar */}
      <div className="flex items-center gap-1 p-2 flex-wrap">
        {/* Font Family Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFontMenu(!showFontMenu)}
            disabled={disabled}
            className="min-w-[120px] justify-between"
          >
            <span className="truncate">
              {fontFamilies.find(f => f.value === formatting.fontFamily)
                ?.name || 'Inter'}
            </span>
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {showFontMenu && (
            <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
              {fontFamilies.map(font => (
                <button
                  key={font.value}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    formatting.fontFamily === font.value
                      ? 'bg-blue-50 text-blue-600'
                      : ''
                  }`}
                  onClick={() => {
                    onFormatChange('fontFamily', font.value)
                    setShowFontMenu(false)
                  }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            disabled={disabled}
            className="min-w-[60px] justify-between"
          >
            <span>{formatting.fontSize}</span>
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {showSizeMenu && (
            <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[60px] max-h-48 overflow-y-auto">
              {fontSizes.map(size => (
                <button
                  key={size}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                    formatting.fontSize === size
                      ? 'bg-blue-50 text-blue-600'
                      : ''
                  }`}
                  onClick={() => {
                    onFormatChange('fontSize', size)
                    setShowSizeMenu(false)
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <Button
          variant={formatting.bold ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => handleToggleFormat('bold')}
          disabled={disabled}
          title="Bold (Ctrl+B)"
        >
          <FormatBoldIcon />
        </Button>

        <Button
          variant={formatting.italic ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => handleToggleFormat('italic')}
          disabled={disabled}
          title="Italic (Ctrl+I)"
        >
          <FormatItalicIcon />
        </Button>

        <Button
          variant={formatting.underline ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => handleToggleFormat('underline')}
          disabled={disabled}
          title="Underline (Ctrl+U)"
        >
          <FormatUnderlineIcon />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <Button
          variant={formatting.textAlign === 'left' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => handleTextAlign('left')}
          disabled={disabled}
          title="Align Left"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h8M4 18h16"
            />
          </svg>
        </Button>

        <Button
          variant={formatting.textAlign === 'center' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => handleTextAlign('center')}
          disabled={disabled}
          title="Align Center"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M8 12h8M4 18h16"
            />
          </svg>
        </Button>

        <Button
          variant={formatting.textAlign === 'right' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => handleTextAlign('right')}
          disabled={disabled}
          title="Align Right"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M8 12h16M4 18h16"
            />
          </svg>
        </Button>

        <Button
          variant={formatting.textAlign === 'justify' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => handleTextAlign('justify')}
          disabled={disabled}
          title="Justify"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant={formatting.listType === 'bullet' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() =>
            handleListType(formatting.listType === 'bullet' ? 'none' : 'bullet')
          }
          disabled={disabled}
          title="Bullet List"
        >
          <FormatListIcon />
        </Button>

        <Button
          variant={formatting.listType === 'numbered' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() =>
            handleListType(
              formatting.listType === 'numbered' ? 'none' : 'numbered'
            )
          }
          disabled={disabled}
          title="Numbered List"
        >
          <FormatNumberedListIcon />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Insert Elements */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onInsertLink}
          disabled={disabled}
          title="Insert Link (Ctrl+K)"
        >
          <FormatLinkIcon />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onInsertImage}
          disabled={disabled}
          title="Insert Image"
        >
          <FormatImageIcon />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onInsertTable}
          disabled={disabled}
          title="Insert Table"
        >
          <FormatTableIcon />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onInsertCode}
          disabled={disabled}
          title="Insert Code Block"
        >
          <FormatCodeIcon />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onInsertQuote}
          disabled={disabled}
          title="Insert Quote"
        >
          <FormatQuoteIcon />
        </Button>

        {/* Active Formatting Indicators */}
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {formatting.bold && (
            <Badge variant="outline" className="text-xs">
              B
            </Badge>
          )}
          {formatting.italic && (
            <Badge variant="outline" className="text-xs">
              I
            </Badge>
          )}
          {formatting.underline && (
            <Badge variant="outline" className="text-xs">
              U
            </Badge>
          )}
          {formatting.listType !== 'none' && (
            <Badge variant="outline" className="text-xs">
              {formatting.listType === 'bullet' ? '•' : '1.'}
            </Badge>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showFontMenu || showSizeMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowFontMenu(false)
            setShowSizeMenu(false)
          }}
        />
      )}
    </div>
  )
}

export default RichTextToolbar
