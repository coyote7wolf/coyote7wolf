'use client'

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Label,
  Badge,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useToast } from '@/hooks/use-toast'
import ClientLayout from '@/components/layout/ClientLayout'
import {
  fetchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/store/slices/documentsSlice'
import type { RootState, AppDispatch } from '@/store'
import type { Document as DocumentType } from '@/store/slices/documentsSlice'

// Icons
const DocumentIcon: React.FC<{ className?: string }> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const FolderIcon: React.FC<{ className?: string }> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
)

const SearchIcon: React.FC<{ className?: string }> = ({
  className = 'h-4 w-4',
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const PlusIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
)

const UploadIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const DownloadIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const DeleteIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

const EditIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
)

const FilterIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
    />
  </svg>
)

const DocumentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { documents, isLoading, error } = useSelector(
    (state: RootState) => state.documents
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'updatedAt' | 'size'>(
    'updatedAt'
  )
  const [filterType, setFilterType] = useState<
    'all' | 'draft' | 'published' | 'archived'
  >('all')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPath, setCurrentPath] = useState('All Documents')
  const { toast } = useToast()

  // Load documents on component mount
  useEffect(() => {
    dispatch(fetchDocuments())
  }, [dispatch])

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error Loading Documents',
        description: error,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      const matchesType = filterType === 'all' || doc.status === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'size':
          return b.size - a.size
        case 'updatedAt':
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      }
    })

  // Format file size
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
  }

  // Format date
  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

  // Handle document selection
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  // Handle document actions
  const handleUpload = () => {
    toast({
      title: 'Upload Document',
      description: 'Upload functionality would be implemented here',
    })
  }

  const handleCreateFolder = () => {
    toast({
      title: 'Create Folder',
      description: 'Folder creation functionality would be implemented here',
    })
  }

  const handleCreateDocument = async () => {
    try {
      const result = await dispatch(
        createDocument({
          title: 'New Document',
          content: '',
          type: 'markdown',
          tags: [],
        })
      )

      if (createDocument.fulfilled.match(result)) {
        toast({
          title: 'Document Created',
          description: 'New document has been created successfully',
        })
        setShowCreateModal(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = (document: DocumentType) => {
    toast({
      title: 'Download Document',
      description: `Downloading ${document.title}...`,
    })
    // Here you would implement actual download logic
  }

  const handleEdit = (document: DocumentType) => {
    toast({
      title: 'Edit Document',
      description: `Opening ${document.title} for editing...`,
    })
    // Here you would navigate to the document editor
    // router.push(`/documents/${document.id}/edit`)
  }

  const handleDelete = async (document: DocumentType) => {
    try {
      await dispatch(deleteDocument(document.id))
      toast({
        title: 'Document Deleted',
        description: `${document.title} has been deleted`,
        variant: 'destructive',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return

    try {
      await Promise.all(
        selectedDocuments.map(id => dispatch(deleteDocument(id)))
      )

      toast({
        title: 'Documents Deleted',
        description: `${selectedDocuments.length} documents have been deleted`,
        variant: 'destructive',
      })
      setSelectedDocuments([])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some documents',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <ClientLayout>
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600 mt-2">
                Manage your files and folders
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateFolder}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FolderIcon />
                New Folder
              </Button>
              <Button
                onClick={handleUpload}
                className="flex items-center gap-2"
              >
                <UploadIcon />
                Upload
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600">
            <span>📁 {currentPath}</span>
          </div>

          {/* Toolbar */}
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FilterIcon />
                    <Select
                      value={filterType}
                      onValueChange={value =>
                        setFilterType(value as typeof filterType)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="files">Files</SelectItem>
                        <SelectItem value="folders">Folders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Select
                      value={sortBy}
                      onValueChange={value => setSortBy(value as typeof sortBy)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modified">Modified</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="size">Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Bulk Actions */}
          {selectedDocuments.length > 0 && (
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedDocuments.length} items selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDocuments([])}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBulkDelete}
                      className="text-red-600 hover:text-red-700"
                    >
                      <DeleteIcon />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Documents List */}
          <div className="space-y-2">
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardBody className="text-center py-12">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No documents found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? 'Try adjusting your search criteria'
                      : 'Start by uploading your first document'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={handleUpload}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <PlusIcon />
                      Upload Document
                    </Button>
                  )}
                </CardBody>
              </Card>
            ) : (
              filteredDocuments.map(document => (
                <Card
                  key={document.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardBody>
                    <div className="flex items-center gap-4">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => toggleDocumentSelection(document.id)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`Select ${document.title}`}
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <DocumentIcon className="text-gray-500" />
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {document.title}
                          </h3>
                          {document.collaborators.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Shared
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>By {document.authorName}</span>
                          <span>
                            {formatDate(new Date(document.updatedAt))}
                          </span>
                          {document.size && (
                            <span>{formatFileSize(document.size)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {document.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                          className="h-8 w-8 p-0"
                        >
                          <DownloadIcon />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(document)}
                          className="h-8 w-8 p-0"
                        >
                          <EditIcon />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(document)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <DeleteIcon />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>

          {/* Stats */}
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {documents.filter(d => d.status === 'published').length}
                  </div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === 'draft').length}
                  </div>
                  <div className="text-sm text-gray-600">Drafts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {documents.filter(d => d.collaborators.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Shared</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatFileSize(
                      documents.reduce(
                        (total, doc) => total + (doc.size || 0),
                        0
                      )
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Size</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </ClientLayout>
  )
}

export default DocumentsPage
