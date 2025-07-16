import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const MyPostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Active');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const navigation = useNavigation();

  const currentUserEmail = auth().currentUser?.email?.trim().toLowerCase();

  const measureMenuPosition = (event, post) => {
    event.target.measure((x, y, width, height, pageX, pageY) => {
      setMenuPosition({
        x: pageX + width - 160,
        y: pageY + height + 5,
      });
      setSelectedPost(post);
      setShowMenu(true);
    });
  };

  const refreshPosts = async () => {
    try {
      if (!currentUserEmail) return;

      const snapshot = await firestore()
        .collection('items')
        .where('email', '==', currentUserEmail)
        .get();

      const allPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(allPosts);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        if (!currentUserEmail) return;

        const snapshot = await firestore()
          .collection('items')
          .where('email', '==', currentUserEmail)
          .get();

        const allPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(allPosts);
      } catch (error) {
        console.error('Error fetching my posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleMenuPress = (event, post) => {
    measureMenuPosition(event, post);
  };

  const handleEdit = () => {
    setEditForm({
      itemName: selectedPost.itemName || '',
      category: selectedPost.category || '',
      description: selectedPost.description || '',
      location: selectedPost.location || '',
    });
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await firestore().collection('items').doc(selectedPost.id).delete();
      Toast.show({
        type: 'success',
        text1: 'Post deleted successfully',
        position: 'bottom',
      });
      setShowDeleteConfirm(false);
      setSelectedPost(null);
      refreshPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to delete post',
        position: 'bottom',
      });
    }
  };

  const handleUpdatePost = async () => {
    if (!editForm.itemName.trim() || !editForm.description.trim() || !editForm.location.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all required fields',
        position: 'bottom',
      });
      return;
    }

    setIsUpdating(true);
    try {
      await firestore().collection('items').doc(selectedPost.id).update({
        itemName: editForm.itemName.trim(),
        category: editForm.category.trim(),
        description: editForm.description.trim(),
        location: editForm.location.trim(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      Toast.show({
        type: 'success',
        text1: 'Post updated successfully',
        position: 'bottom',
      });
      setShowEditModal(false);
      setSelectedPost(null);
      setEditForm({});
      refreshPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update post',
        position: 'bottom',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredPosts = posts.filter(item =>
    filter === 'Show All'
      ? true
      : filter === 'Active'
      ? (item.status === 'Active' || !item.status)
      : item.itemType === filter
  );

  const handlePostItem = () => {
    navigation.navigate('PostItem');
  };

  const handleBack = () => {
    navigation.goBack();
  };

const renderItem = ({ item }) => (
  <View style={styles.card}>
    <TouchableOpacity
      style={styles.cardContent}
      onPress={() => navigation.navigate('ItemDetail', { item })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
      />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.itemName}</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(event) => handleMenuPress(event, item)}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{item.itemType}</Text>
        <Text style={styles.status}>
          {item.status || 'Active'}
        </Text>
        {item.createdAt?.toDate && (
          <Text style={styles.date}>
            {item.createdAt.toDate().toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  </View>
);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Posts</Text>
          <Text style={styles.headerSubtitle}>Manage your lost and found items</Text>
        </View>
      </View>

      {/* FILTERS */}
      <View style={styles.filters}>
        {['Active', 'Lost', 'Found', 'Show All'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterButton,
              filter === tab && styles.activeFilter,
            ]}
            onPress={() => setFilter(tab)}
          >
            <Text style={filter === tab ? styles.activeFilterText : styles.filterText}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4B6CB7" />
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color="#CBD5E1"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Posts Found</Text>
          <Text style={styles.emptySubtitle}>
            You haven't posted any items yet. Start by reporting a lost or found item!
          </Text>
          <TouchableOpacity style={styles.postButton} onPress={handlePostItem}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.postButtonText}>Post an Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Three-dot Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { left: menuPosition.x, top: menuPosition.y }]}>
            <View style={styles.menuArrow} />
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color="#4B6CB7" />
              <Text style={styles.menuItemText}>Edit Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
              <Text style={[styles.menuItemText, { color: '#DC2626' }]}>Delete Post</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmContainer}>
            <View style={styles.confirmIcon}>
              <Ionicons name="alert-circle-outline" size={48} color="#4B6CB7" />
            </View>
            <Text style={styles.confirmTitle}>Delete Post</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete "{selectedPost?.itemName}"? This action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Keep Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editContainer}>
            <View style={styles.editHeader}>
              <View style={styles.editHeaderContent}>
                <Ionicons name="create-outline" size={24} color="#4B6CB7" />
                <Text style={styles.editTitle}>Edit Post</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.itemName}
                  onChangeText={(text) => setEditForm({...editForm, itemName: text})}
                  placeholder="Enter item name"
                  placeholderTextColor="#A3AAB8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.category}
                  onChangeText={(text) => setEditForm({...editForm, category: text})}
                  placeholder="Enter category"
                  placeholderTextColor="#A3AAB8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({...editForm, description: text})}
                  placeholder="Describe the item"
                  placeholderTextColor="#A3AAB8"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                  placeholder="Enter location"
                  placeholderTextColor="#A3AAB8"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
              onPress={handleUpdatePost}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Updating...' : 'Update Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyPostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF0F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    elevation: 2,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FAFAFA',
    paddingVertical: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E6EAF0',
  },
  activeFilter: {
    backgroundColor: '#4B6CB7',
  },
  filterText: {
    color: '#333',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#475569',
    marginBottom: 20,
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: '#4B6CB7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
    card: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    padding: 8,
    alignItems: 'center',
  },
  image: {
    width: 110,
    height: 110,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  info: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    color: '#4B6CB7',
    marginTop: 4,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    minWidth: 160,
    zIndex: 1000,
  },
  menuArrow: {
    position: 'absolute',
    top: -8,
    right: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF0',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  confirmContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 40,
    maxWidth: 320,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  confirmIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4B6CB7',
  },
  cancelButton: {
    backgroundColor: '#64748B',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editContainer: {
    height: '88%',
    width: '90%',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    alignSelf: 'center',
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF0',
  },
  editHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  editForm: {
    padding: 20,
    flex: 1,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
  },
  input: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    width: '100%',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    width: '100%',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4B6CB7',
    margin: 20,
    elevation: 4,
    shadowColor: '#4B6CB7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  updateButtonDisabled: {
    backgroundColor: '#E6EAF0',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
