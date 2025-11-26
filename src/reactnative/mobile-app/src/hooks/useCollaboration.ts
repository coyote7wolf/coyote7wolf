import {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch} from '../store'
import {
  connectToCollaboration,
  joinDocument,
  sendOperation,
  sendCursorUpdate,
  documentUpdateReceived,
  cursorUpdateReceived,
  userJoined,
  userLeft,
  conflictDetected,
  conflictResolved,
  operationAcknowledged,
  selectIsConnected,
  selectCurrentDocumentId,
} from '../store/collaborationSlice'
import {collaborationService} from '../services/collaborationService'

export const useCollaboration = (documentId?: string) => {
  const dispatch = useDispatch<AppDispatch>()
  const isConnected = useSelector(selectIsConnected)
  const currentDocumentId = useSelector(selectCurrentDocumentId)
  // Connect to collaboration service
  useEffect(() => {
    if (!isConnected) {
      dispatch(connectToCollaboration())
    }
  }, [dispatch, isConnected])

  // Join document when documentId changes
  useEffect(() => {
    if (isConnected && documentId && documentId !== currentDocumentId) {
      dispatch(joinDocument(documentId))
    }
  }, [dispatch, isConnected, documentId, currentDocumentId])

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) {
      return
    }

    // Document update events
    const handleDocumentUpdate = (data: {
      operation: any
      user: {id: string; name: string; color: string}
    }) => {
      dispatch(documentUpdateReceived(data))
    }

    // Cursor update events
    const handleCursorUpdate = (data: {cursor: any}) => {
      dispatch(cursorUpdateReceived(data))
    }

    // User joined events
    const handleUserJoined = (data: {userId: string; userName: string}) => {
      dispatch(userJoined(data))
    }

    // User left events
    const handleUserLeft = (data: {userId: string}) => {
      dispatch(userLeft(data))
    }

    // Conflict detection events
    const handleConflictDetected = (data: {
      operation: any
      conflictWith: any
    }) => {
      dispatch(conflictDetected(data))
    }

    // Conflict resolution events
    const handleConflictResolved = (data: {
      conflictId: string
      resolvedOperation: any
    }) => {
      dispatch(conflictResolved(data))
    }

    // Operation acknowledged events
    const handleOperationAcknowledged = (data: {operationId: string}) => {
      dispatch(operationAcknowledged(data))
    }

    // Register event listeners
    collaborationService.on('document-update', handleDocumentUpdate)
    collaborationService.on('cursor-update', handleCursorUpdate)
    collaborationService.on('user-join', handleUserJoined)
    collaborationService.on('user-leave', handleUserLeft)
    collaborationService.on('conflict-detected', handleConflictDetected)
    collaborationService.on('conflict-resolved', handleConflictResolved)
    collaborationService.on(
      'operation-acknowledged',
      handleOperationAcknowledged,
    )

    return () => {
      collaborationService.off('document-update', handleDocumentUpdate)
      collaborationService.off('cursor-update', handleCursorUpdate)
      collaborationService.off('user-join', handleUserJoined)
      collaborationService.off('user-leave', handleUserLeft)
      collaborationService.off('conflict-detected', handleConflictDetected)
      collaborationService.off('conflict-resolved', handleConflictResolved)
      collaborationService.off(
        'operation-acknowledged',
        handleOperationAcknowledged,
      )
    }
  }, [dispatch, isConnected])

  // Helper functions
  const sendTextOperation = async (
    type: 'insert' | 'delete' | 'replace',
    position: number,
    content?: string,
    length?: number,
  ) => {
    if (!isConnected || !currentDocumentId) {
      return
    }

    try {
      await dispatch(
        sendOperation({
          type,
          position,
          content,
          length,
        }),
      ).unwrap()
    } catch (error) {
      console.error('Failed to send operation:', error)
    }
  }

  const sendCursor = async (
    position: number,
    selection?: {start: number; end: number},
  ) => {
    if (!isConnected || !currentDocumentId) {
      return
    }

    try {
      await dispatch(sendCursorUpdate({position, selection})).unwrap()
    } catch (error) {
      console.error('Failed to send cursor update:', error)
    }
  }

  const insertText = (position: number, text: string) => {
    sendTextOperation('insert', position, text)
  }

  const deleteText = (position: number, length: number) => {
    sendTextOperation('delete', position, undefined, length)
  }

  const replaceText = (position: number, length: number, text: string) => {
    sendTextOperation('replace', position, text, length)
  }

  const updateCursor = (
    position: number,
    selection?: {start: number; end: number},
  ) => {
    sendCursor(position, selection)
  }

  return {
    isConnected,
    currentDocumentId,
    insertText,
    deleteText,
    replaceText,
    updateCursor,
  }
}

export default useCollaboration
