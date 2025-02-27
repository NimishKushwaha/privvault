import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
  Fade,
  Paper,
  useTheme,
  useMediaQuery,
  Pagination,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { encryptData, decryptData } from '../utils/crypto'
import { itemsApi } from '../services/api'
import { SecureItem } from '../types/item'
import { compressData } from '../utils/compression'

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export default function Dashboard() {
  const [items, setItems] = useState<SecureItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages] = useState(1)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<SecureItem | null>(null)
  const [editItem, setEditItem] = useState<{
    id: string;
    title: string;
    content: string;
    category: string;
    fileName?: string;
  } | null>(null)
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: 'password',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await itemsApi.getAll()
        setItems(items)
      } catch (error) {
        console.error('Failed to fetch items:', error)
      }
    }
    fetchItems()
  }, [page])

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content) return;

    setIsLoading(true);

    try {
      console.log('Adding new item of category:', newItem.category);
      
      const content = newItem.category === 'document' ? 
        newItem.content : 
        await encryptData(newItem.content);
      
      console.log('Content type before save:', typeof content);

      const item = await itemsApi.create({
        title: newItem.title,
        content: content,
        category: newItem.category,
        fileName: selectedFile?.name || null
      });

      setItems(prevItems => [item, ...prevItems]);
      setNewItem({ title: '', content: '', category: 'password' });
      setSelectedFile(null);
      setOpen(false);
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (item: SecureItem) => {
    try {
      console.log('Viewing item of category:', item.category);
      console.log('Content type before decrypt:', typeof item.encryptedContent);
      
      // For documents, check if it's base64 encoded
      if (item.category === 'document') {
        let content = item.encryptedContent;
        
        // If it's a PDF, decrypt the content
        if (item.fileName?.toLowerCase().endsWith('.pdf')) {
          try {
            const decryptedContent = await decryptData(content);
            content = `data:application/pdf;base64,${decryptedContent}`;
          } catch (error) {
            console.error('Error decrypting PDF content:', error);
            alert('Failed to decrypt PDF content. Please try again.');
            return;
          }
        }

        // For images, convert to data URL
        if (!content.startsWith('data:')) {
          if (content.startsWith('/9j/')) {
            content = `data:image/jpeg;base64,${content}`;
          } else if (content.startsWith('iVBORw0KGgo')) {
            content = `data:image/png;base64,${content}`;
          }
        }
        
        setSelectedItem({
          ...item,
          encryptedContent: content
        });
        return;
      }

      // For all other items, attempt decryption
      console.log('Attempting decryption...');
      const decryptedContent = await decryptData(item.encryptedContent);
      console.log('Content type after decrypt:', typeof decryptedContent);
      
      // Log the decrypted content to the console
      console.log('Decrypted content:', decryptedContent);
      
      setSelectedItem({ 
        ...item, 
        encryptedContent: decryptedContent 
      });
    } catch (err) {
      const error = err as Error;
      console.error('Decryption failed:', error);
      
      // If it's a document and decryption failed, try to display it anyway
      if (item.category === 'document') {
        console.log('Attempting to display document without decryption');
        let content = item.encryptedContent;
        
        // Try to format as data URL if needed
        if (!content.startsWith('data:')) {
          if (item.fileName?.toLowerCase().endsWith('.pdf')) {
            content = `data:application/pdf;base64,${content}`;
          }
        }
        
        setSelectedItem({
          ...item,
          encryptedContent: content
        });
        return;
      }
      
      alert('Failed to decrypt content. Please try again or contact support if the issue persists.');
      setSelectedItem(null);
    }
  };

  const handleEdit = async (item: SecureItem) => {
    try {
      const decryptedContent = await decryptData(item.encryptedContent)
      setEditItem({
        id: item.id,
        title: item.title,
        content: decryptedContent,
        category: item.category,
        fileName: item.fileName || undefined
      })
      setEditOpen(true)
    } catch (error) {
      console.error('Decryption failed:', error)
    }
  }

  const handleUpdate = async () => {
    if (!editItem) return;

    setIsLoading(true);

    try {
      const updatedItem = await itemsApi.update(editItem.id, {
        title: editItem.title,
        content: editItem.content,
        category: editItem.category,
        fileName: editItem.fileName || null
      });

      setItems(items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
      setEditOpen(false);
      setEditItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await itemsApi.delete(id)
      setItems(prevItems => prevItems.filter(item => item.id !== id))
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        alert('File is too large. Maximum size is 50MB.');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const content = e.target.result as string;
          // Compress data if it's a document
          const processedContent = file.type.startsWith('application/') ? 
            compressData(content) : content;

          setNewItem(prev => ({
            ...prev,
            content: processedContent,
            fileName: file.name
          }));
        }
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        alert('File is too large. Maximum size is 50MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && editItem) {
          setEditItem({
            ...editItem,
            content: event.target.result as string,
            fileName: file.name
          });
        }
      };
      
      if (file.type === 'text/plain' || file.type.startsWith('application/')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file); // Read as Data URL for images
      }
    }
  };

  const renderContentField = () => {
    if (newItem.category === 'document') {
      return (
        <Box sx={{ mt: 2 }}>
          <input
            accept=".txt,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              {selectedFile ? selectedFile.name : 'Upload Document'}
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </Box>
      )
    }

    return (
      <TextField
        margin="dense"
        label="Content"
        fullWidth
        multiline
        rows={4}
        value={newItem.content}
        onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
      />
    )
  }

  const renderEditContentField = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <input
          accept=".txt,.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif"
          style={{ display: 'none' }}
          id="edit-file-upload"
          type="file"
          onChange={handleEditFileChange}
        />
        <label htmlFor="edit-file-upload">
          <Button
            component="span"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            fullWidth
          >
            Upload New Document or Image
          </Button>
        </label>
        {editItem?.fileName && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Current file: {editItem.fileName}
          </Typography>
        )}
      </Box>
    );
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const renderContent = (content: string, fileName?: string | null) => {
    // For documents (PDFs, images, etc.)
    if (content.startsWith('data:') || 
        content.startsWith('JVBERi0') || 
        content.startsWith('%PDF')) {
      try {
        // For PDFs, we need to create a data URL if it's not already one
        let dataUrl = content;
        
        // Check if it's a PDF by content or filename
        const isPdf = content.startsWith('JVBERi0') || 
                     content.startsWith('%PDF') || 
                     fileName?.toLowerCase().endsWith('.pdf');
        
        // Create data URL for PDF if needed
        if (isPdf && !content.startsWith('data:')) {
          dataUrl = `data:application/pdf;base64,${btoa(content)}`;
        }

        // Check if it's an image
        const isImage = dataUrl.startsWith('data:image/');

        // Show preview only for images
        if (isImage) {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" gutterBottom>
                File: {fileName || 'Image'}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                maxHeight: '70vh',
                overflow: 'auto'
              }}>
                <img 
                  src={dataUrl}
                  alt={fileName || 'Image'} 
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = dataUrl;
                  link.download = fileName || 'image';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                startIcon={<CloudUploadIcon />}
              >
                Download Image
              </Button>
            </Box>
          );
        }

        // For PDFs and other files, show download button only
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            alignItems: 'center',
            p: 4 
          }}>
            <Typography variant="h6" gutterBottom>
              {fileName || 'Document'}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
              Click the button below to download the file.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = fileName || 'document';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              startIcon={<CloudUploadIcon />}
            >
              Download {fileName || 'Document'}
            </Button>
          </Box>
        );
      } catch (error) {
        console.error('Error rendering content:', error);
        return (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error" gutterBottom>
              Error displaying content.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The file might be corrupted or in an unsupported format.
            </Typography>
          </Box>
        );
      }
    }

    // For text content (passwords, notes, etc)
    return (
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: selectedItem?.category === 'password' ? 'monospace' : 'inherit'
          }}
        >
          {content}
        </Typography>
      </Box>
    );
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%', // Prevents horizontal scrollbar
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        flex: 1,
        p: { xs: 2, sm: 3 }, 
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        overflow: 'auto', // Enables scrolling for content
      }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 2, md: 3 },
            mb: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h1"
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.5rem', md: '1.75rem' } 
            }}
          >
            My Secure Items
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' },
          }}>
            <TextField
              placeholder="Search items..."
              size={isMobile ? "small" : "medium"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth={isMobile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              fullWidth={isMobile}
              size={isMobile ? "small" : "medium"}
            >
              Add New
            </Button>
          </Box>
        </Paper>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 3 }}
          sx={{
            width: '100%',
            margin: 0, // Reset margin
            '& > .MuiGrid-item': {
              paddingTop: { xs: 2, sm: 3 },
            },
          }}
        >
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Fade in={true}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 1, sm: 2 },
                      mb: 2 
                    }}>
                      <Typography 
                        variant="h6" 
                        noWrap 
                        sx={{ 
                          flex: 1,
                          fontSize: { xs: '1rem', sm: '1.25rem' } 
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Chip
                        size={isMobile ? "small" : "medium"}
                        label={item.category}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Created: {formatDate(item.createdAt)}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mt: 2,
                      justifyContent: { xs: 'center', sm: 'flex-start' } 
                    }}>
                      <Tooltip title="View">
                        <IconButton 
                          size={isMobile ? "small" : "medium"} 
                          onClick={() => handleView(item)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size={isMobile ? "small" : "medium"}
                          onClick={() => handleEdit(item)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size={isMobile ? "small" : "medium"}
                          color="error"
                          onClick={() => handleDelete(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { m: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LockIcon color="primary" />
              Add New Secure Item
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              disabled={isLoading}
            />
            <TextField
              select
              margin="dense"
              label="Category"
              fullWidth
              value={newItem.category}
              onChange={(e) => {
                setNewItem({ ...newItem, category: e.target.value })
                setSelectedFile(null)
              }}
              SelectProps={{ 
                native: true,
                'aria-label': "Select item category"
              }}
              disabled={isLoading}
            >
              <option value="password">Password</option>
              <option value="note">Secure Note</option>
              <option value="document">Document</option>
            </TextField>
            {renderContentField()}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button
              onClick={handleAddItem}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { m: 2 }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon color="primary" />
              Edit Secure Item
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={editItem?.title || ''}
              onChange={(e) => setEditItem(prev => 
                prev ? { ...prev, title: e.target.value } : null
              )}
              disabled={isLoading}
            />
            <TextField
              select
              margin="dense"
              label="Category"
              id="item-category-select"
              aria-label="Select item category"
              title="Select item category"
              fullWidth
              value={editItem?.category || ''}
              onChange={(e) => setEditItem(prev => 
                prev ? { ...prev, category: e.target.value } : null
              )}
              SelectProps={{ 
                native: true
              }}
              disabled={isLoading}
            >
              <option value="password">Password</option>
              <option value="note">Secure Note</option>
              <option value="document">Document</option>
            </TextField>
            {renderEditContentField()}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setEditOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              startIcon={<EditIcon />}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Item'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              m: 2,
              minHeight: selectedItem?.category === 'document' ? '80vh' : 'auto'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="span">
              {selectedItem?.title}
            </Typography>
            <Chip
              size="small"
              label={selectedItem?.category}
              color="primary"
            />
          </DialogTitle>
          <DialogContent>
            {selectedItem && renderContent(selectedItem.encryptedContent, selectedItem.fileName)}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedItem(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
    </Box>
  )
} 