import React, {useState, useEffect} from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native'
import {useSelector, useDispatch} from 'react-redux'
import {useNavigation} from '@react-navigation/native'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import {RootState, AppDispatch} from '../store'
import {
  fetchDocuments,
  createDocument,
  removeDocument,
} from '../store/documentsSlice'
import {Document, RootStackParamList} from '../types'
import {Card, Button} from '../components'
import {lightTheme} from '../utils/theme'

type DocumentsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>

export default function DocumentsScreen() {
  const navigation = useNavigation<DocumentsScreenNavigationProp>()
  const dispatch = useDispatch<AppDispatch>()
  const {documents, error} = useSelector((state: RootState) => state.documents)
  const {user} = useSelector((state: RootState) => state.auth)

  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      dispatch(fetchDocuments())
    }
  }, [dispatch, user])

  const handleRefresh = async () => {
    setRefreshing(true)
    await dispatch(fetchDocuments())
    setRefreshing(false)
  }

  const handleCreateDocument = () => {
    Alert.prompt(
      '新建文档',
      '请输入文档标题',
      [
        {text: '取消', style: 'cancel'},
        {
          text: '创建',
          onPress: (title?: string) => {
            if (title?.trim()) {
              dispatch(
                createDocument({
                  title: title.trim(),
                  content: '',
                  type: 'article',
                }),
              )
            }
          },
        },
      ],
      'plain-text',
    )
  }

  const handleDeleteDocument = (documentId: string) => {
    Alert.alert('删除文档', '确定要删除此文档吗？', [
      {text: '取消', style: 'cancel'},
      {
        text: '删除',
        style: 'destructive',
        onPress: () => dispatch(removeDocument(documentId)),
      },
    ])
  }

  const handleEditDocument = (document: Document) => {
    navigation.navigate('Document', {documentId: document.id})
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'published':
        return lightTheme.colors.success
      case 'draft':
        return lightTheme.colors.warning
      case 'review':
        return lightTheme.colors.info
      case 'archived':
        return lightTheme.colors.disabled
      default:
        return lightTheme.colors.text
    }
  }

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'published':
        return '已发布'
      case 'draft':
        return '草稿'
      case 'review':
        return '审核中'
      case 'archived':
        return '已归档'
      default:
        return status
    }
  }

  const renderDocumentItem = ({item}: {item: Document}) => (
    <Card style={styles.documentCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleEditDocument(item)}>
        <View style={styles.documentHeader}>
          <Text style={styles.documentTitle}>{item.title}</Text>
          <View style={styles.documentActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteDocument(item.id)}>
              <MaterialIcons
                name="delete"
                size={20}
                color={lightTheme.colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.documentContent} numberOfLines={2}>
          {item.content || '暂无内容...'}
        </Text>

        <View style={styles.documentFooter}>
          <View style={styles.documentMeta}>
            <Text style={styles.documentAuthor}>作者: {item.authorName}</Text>
            <Text style={styles.documentDate}>
              {new Date(item.createdAt).toLocaleDateString('zh-CN')}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(item.status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  )

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error" size={48} color={lightTheme.colors.error} />
        <Text style={styles.errorText}>加载文档失败</Text>
        <Button title="重试" onPress={() => dispatch(fetchDocuments())} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的文档</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateDocument}>
          <MaterialIcons
            name="add"
            size={24}
            color={lightTheme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={lightTheme.colors.disabled}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索文档..."
          placeholderTextColor={lightTheme.colors.disabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredDocuments}
        renderItem={renderDocumentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="description"
              size={64}
              color={lightTheme.colors.disabled}
            />
            <Text style={styles.emptyText}>
              {searchQuery ? '未找到匹配的文档' : '暂无文档'}
            </Text>
            {!searchQuery && (
              <Button title="创建第一个文档" onPress={handleCreateDocument} />
            )}
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightTheme.colors.text,
  },
  createButton: {
    padding: lightTheme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: lightTheme.spacing.md,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: lightTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: lightTheme.colors.text,
    fontSize: 16,
  },
  listContainer: {
    padding: lightTheme.spacing.md,
    paddingTop: 0,
  },
  documentCard: {
    marginBottom: lightTheme.spacing.md,
  },
  cardContent: {
    padding: lightTheme.spacing.md,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: lightTheme.spacing.sm,
  },
  documentTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: lightTheme.colors.text,
    marginRight: lightTheme.spacing.sm,
  },
  documentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: lightTheme.spacing.xs,
  },
  documentContent: {
    fontSize: 14,
    color: lightTheme.colors.textSecondary,
    marginBottom: lightTheme.spacing.md,
    lineHeight: 20,
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  documentMeta: {
    flex: 1,
  },
  documentAuthor: {
    fontSize: 12,
    color: lightTheme.colors.disabled,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: lightTheme.colors.disabled,
  },
  statusBadge: {
    paddingHorizontal: lightTheme.spacing.sm,
    paddingVertical: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: lightTheme.colors.disabled,
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.lg,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: lightTheme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: lightTheme.colors.error,
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.lg,
    textAlign: 'center',
  },
})
