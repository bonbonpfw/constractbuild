import React, { useState } from "react";
import styled from 'styled-components';
import { FaTrash, FaUpload, FaEye, FaFileAlt } from "react-icons/fa";
import {
  DialogOverlay,
  DialogContainer,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
  DialogActions,
  Button
  } from '../../styles/SharedStyles';
import { DocumentState } from "../../types";

export interface FileAreaDocument {
  fileName: string | null;
  fileType: string;
  fileId?: string;
  state: DocumentState;
}

// Container for the entire file area - redesigned with Apple-style aesthetics
const FileAreaContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 12px;
  flex: 1 1 auto;
  min-height: 0;
`;

// Main file area with tabs
const FileAreaContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
`;

// Container for the file list - גלילה פנימית בלבד
const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  overflow-y: auto;
  min-height: 0;
  height: 400px; /* Fixed height for scrolling */

  @media (min-width: 1024px) {
    height: auto; /* Larger screens */
    overflow-y: visible; /* Remove scrollbar if not needed */
  }
`;

// Individual file item with Apple design influence
const FileItemContainer = styled.div<{ disabled: boolean; state: DocumentState }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: ${p =>
    p.state === DocumentState.MISSING ? '#fff8f8'
    : p.disabled     ? '#f9f9f9'
                     : '#ffffff'};
  border: 1px solid ${p => p.state === DocumentState.MISSING ? '#ffdddd' : '#f0f0f0'};
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &:hover {
    background-color: ${p =>
      p.state === DocumentState.MISSING ? '#fff5f5'
      : p.disabled     ? '#f9f9f9'
                       : '#f9f9f9'};
    transform: ${p => p.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${p => p.disabled ? '0 1px 2px rgba(0, 0, 0, 0.03)' : '0 3px 6px rgba(0, 0, 0, 0.06)'};
  }
`;

// Left side of file item with icon and info
const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0; /* Allows text to truncate */
`;

const FileIcon = styled.div<{ state: DocumentState }>`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 6px;
  background-color: ${p => p.state === DocumentState.MISSING ? '#fff0f0' : '#f0f7ff'};
  color: ${p => p.state === DocumentState.MISSING ? '#ff6b6b' : '#0071e3'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0; /* Enables text truncation */
`;

// Badge showing file type
const FileTypeBadge = styled.span<{ state: DocumentState }>`
  background-color: ${p => p.state === DocumentState.MISSING ? '#ffefef' : '#f0f7ff'};
  color: ${p => p.state === DocumentState.MISSING ? '#ff6b6b' : '#0071e3'};
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 4px;
  margin-bottom: 2px;
  display: inline-block;
`;

// Name of the file, with Apple-style typography
const FileName = styled.span<{ state: DocumentState }>`
  font-size: 13px;
  font-weight: 500;
  color: ${p => p.state === DocumentState.MISSING ? '#ff6b6b' : '#4b6b8e'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Container for action icons
const Actions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

// Apple-style button
const ActionButton = styled.button<{ disabled: boolean; danger?: boolean }>`
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  padding: 5px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: ${p =>
    p.disabled       ? '#ccc'
    : p.danger       ? '#ff3b30'
                    : '#0071e3'};
  opacity: ${p => p.disabled ? 0.5 : 1};

  &:hover {
    background-color: ${p => 
      p.disabled ? 'transparent' 
      : p.danger ? '#fff5f5' 
      : '#f0f7ff'};
  }
`;

// PDF Preview Dialog with Apple-style design
export const FilePreview: React.FC<{
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}> = ({ fileUrl, fileName, onClose }) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const lowerFileName = fileName?.toLowerCase() || '';
  const isImage = imageExtensions.some(ext => lowerFileName.endsWith(ext));

  // Zoom state for images
  const [zoom, setZoom] = React.useState(1);
  const [dragging, setDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [startDrag, setStartDrag] = React.useState<{ x: number; y: number } | null>(null);
  const imgContainerRef = React.useRef<HTMLDivElement>(null);

  // Reset zoom and position when file changes
  React.useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setDragging(false);
    setStartDrag(null);
  }, [fileUrl]);

  // Mouse/touch event handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !startDrag) return;
    setPosition({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y });
  };
  const handleMouseUp = () => {
    setDragging(false);
    setStartDrag(null);
  };
  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom === 1) return;
    const touch = e.touches[0];
    setDragging(true);
    setStartDrag({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !startDrag) return;
    const touch = e.touches[0];
    setPosition({ x: touch.clientX - startDrag.x, y: touch.clientY - startDrag.y });
  };
  const handleTouchEnd = () => {
    setDragging(false);
    setStartDrag(null);
  };

  // Clamp zoom
  const minZoom = 0.2;
  const maxZoom = 5;
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, maxZoom));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, minZoom));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <DialogOverlay 
      onClick={onClose}
      style={{ 
        justifyContent: 'flex-end', 
        alignItems: 'stretch',
        background: 'rgba(0, 0, 0, 0.4)'
      }}
    >
      <DialogContainer 
        onClick={e => e.stopPropagation()} 
        style={{ 
          margin: '0',
          borderRadius: '16px 0 0 16px',
          width: '45%',
          maxWidth: '600px',
          height: '100%', 
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-2px 0 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ 
          padding: '16px', 
          flex: '1', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isImage ? (
            <>
              {/* Zoom Controls */}
              <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                {/* Only show zoom out if zoom > 1 */}
                <Button variant="contained" disabled={zoom === 1} onClick={handleZoomOut}>-</Button>
                <span style={{ marginTop: 7, minWidth: 40, textAlign: 'center', fontWeight: 500 }}>{Math.round(zoom * 100)}%</span>
                <Button variant="contained" onClick={handleZoomIn} disabled={zoom >= maxZoom}>+</Button>
                {/*<Button variant="text" onClick={handleReset} disabled={zoom === 1 && position.x === 0 && position.y === 0}>Reset</Button>*/}
              </div>
              <div
                ref={imgContainerRef}
                style={{
                  width: '100%',
                  height: '70vh',
                  maxWidth: 560,
                  maxHeight: 700,
                  overflow: zoom > 1 ? 'scroll' : 'hidden',
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px #0001',
                  cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                  position: 'relative',
                  userSelect: 'none',
                  touchAction: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={fileUrl}
                  alt={fileName}
                  draggable={false}
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)` ,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: 8,
                    background: '#fff',
                    boxShadow: '0 2px 8px #0001',
                    transition: dragging ? 'none' : 'transform 0.2s',
                    cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none',
                  }}
                />
              </div>
            </>
          ) : (
            <iframe
              src={fileUrl}
              title={fileName}
              width="100%"
              style={{ 
                border: 'none',
                flex: '1',
                minHeight: '500px',
                borderRadius: '8px'
              }}
            />
          )}
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

// Email Dialog for sending file to signer
const EmailDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => void;
  fileNames: string[];
}> = ({ isOpen, onClose, onSend, fileNames }) => {
  const [email, setEmail] = React.useState('');
  if (!isOpen) return null;
  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()} style={{ borderRadius: '16px', maxWidth: '450px' }}>
        <DialogHeader>
          <DialogTitle>Send {fileNames.length > 1 ? `${fileNames.length} files` : `"${fileNames[0]}"`}</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ padding: 24 }}>
          <label style={{ fontWeight: 500, fontSize: 16, display: 'block', marginBottom: '8px' }}>Recipient Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter email address"
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '16px', 
              borderRadius: '8px', 
              border: '1px solid #e0e0e0',
              marginBottom: '24px'
            }}
            autoFocus
          />
          <DialogActions style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="text" onClick={onClose}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => { onSend(email); setEmail(''); }}
              style={{ 
                backgroundColor: '#0071e3',
                borderRadius: '8px',
                padding: '8px 16px'
              }}
            >
              Send
            </Button>
          </DialogActions>
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

// Single FileItem component with redesigned Apple look
const FileItem: React.FC<{
  fileId: string;
  fileName: string;
  fileType: string;
  state: DocumentState;
  disabled: boolean;
  onUpload?: (fileType: string, file: File, mode: 'auto' | 'manual') => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
  onRequestUpload: (fileType: string, file: File) => void;
}> = ({ 
  fileId, 
  fileName, 
  fileType, 
  state, 
  disabled, 
  onUpload,
  onDelete,
  onPreview,
  onRequestUpload
}) => {
  const handleUpload = async () => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      const file = files[0];
      onRequestUpload(fileType, file);
    };
    input.click();
  };

    const handleDelete = () => {
    if (disabled || state === DocumentState.MISSING || !onDelete) return;
    onDelete(fileId);
  };

  const handlePreview = () => {
    if (state === DocumentState.MISSING || !onPreview) return;
    onPreview(fileId, fileName || '');
  };

  return (
    <FileItemContainer disabled={disabled} state={state}>
      <FileInfo>
        <FileIcon state={state}>
          <FaFileAlt />
        </FileIcon>
        <FileDetails>
          <FileTypeBadge state={state}>{fileType}</FileTypeBadge>
          <FileName state={state}>
            {state === DocumentState.UPLOADED ? fileName : 'Missing document'}
          </FileName>
        </FileDetails>
      </FileInfo>
      <Actions>
          {state === DocumentState.MISSING ? (
            <ActionButton
              disabled={disabled}
              onClick={handleUpload}
              title="Upload document"
            >
              <FaUpload />
            </ActionButton>
          ) : (
            <>
              <ActionButton
                disabled={false}
                onClick={handlePreview}
                title="Preview"
              >
                <FaEye />
              </ActionButton>
              <ActionButton
                disabled={disabled}
                danger
                onClick={handleDelete}
                title="Delete"
              >
                <FaTrash />
              </ActionButton>
            </>
          )}
        </Actions>
    </FileItemContainer>
  );
};

// Main FileArea component with tabbed interface
type FileAreaProps = {
  files: FileAreaDocument[];
  disabled: boolean;
  onUpload?: (fileType: string, file: File, mode: 'auto' | 'manual') => void;
  onDelete?: (fileId: string) => void;
  onPreview?: (fileId: string, fileName: string) => void;
  onUploadGeneral?: (file: File) => void;
  isAutoFill?: boolean;
  showAddDoc?: boolean;
};

const FileArea: React.FC<FileAreaProps> = ({
  files,
  disabled,
  onUpload,
  onDelete,
  onPreview,
  onUploadGeneral,
  isAutoFill,
  showAddDoc
}) => {
  const [showUploadModeDialog, setShowUploadModeDialog] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ fileType: string; file: File } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleRequestUpload = (fileType: string, file: File) => {
    if (isAutoFill) {
      setPendingUpload({ fileType, file });
      setShowUploadModeDialog(true);
    } else {
      // Always upload in manual mode if isAutoFill is false or not provided
      if (onUpload) {
        onUpload(fileType, file, 'manual');
      }
    }
  };

  const handleConfirmUploadMode = (mode: 'auto' | 'manual') => {
    if (pendingUpload && onUpload) {
      onUpload(pendingUpload.fileType, pendingUpload.file, mode);
    }
    setShowUploadModeDialog(false);
    setPendingUpload(null);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || !onUploadGeneral) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUploadGeneral(files[0]);
    }
  };
  const handleGeneralUploadClick = () => {
    if (disabled || !onUploadGeneral) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpeg,.png';
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      onUploadGeneral(files[0]);
    };
    input.click();
  };
  return (
    <FileAreaContainer>
      <FileAreaContent>
        <FileListContainer>
          {files.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#888', fontSize: '14px' }}>
              אין מסמכים זמינים
            </div>
          ) : (
            files.map((file, index) => (
              <FileItem
                key={`${file.fileType}-${index}`}
                fileId={file.fileId || ''}
                fileName={file.fileName || ''}
                fileType={file.fileType}
                state={file.state}
                disabled={disabled}
                onUpload={onUpload}
                onDelete={onDelete}
                onPreview={onPreview}
                onRequestUpload={handleRequestUpload}
              />
            ))
          )}
        </FileListContainer>
      </FileAreaContent>
      {/* Upload Mode Dialog */}
      <UploadModeDialog
        isOpen={showUploadModeDialog}
        onClose={() => {
          setShowUploadModeDialog(false);
          setPendingUpload(null);
        }}
        onConfirm={handleConfirmUploadMode}
      />
    </FileAreaContainer>
  );
};

// Upload Mode Dialog for choosing Auto fill or Manual
const UploadModeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: 'auto' | 'manual') => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const [mode, setMode] = React.useState<'auto' | 'manual'>('auto');
  React.useEffect(() => { if (isOpen) setMode('auto'); }, [isOpen]);
  if (!isOpen) return null;
  return (
    <DialogOverlay style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      <DialogContainer 
        onClick={e => e.stopPropagation()} 
        style={{ borderRadius: '16px', maxWidth: '450px' }}
      >
        <DialogHeader>
          <DialogTitle>העלאה מסמך</DialogTitle>
          <DialogCloseButton onClick={onClose}>&times;</DialogCloseButton>
        </DialogHeader>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 500, fontSize: 16, marginBottom: 12 }}></label>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                <input 
                  type="radio" 
                  name="upload-mode" 
                  value="auto" 
                  checked={mode === 'auto'} 
                  onChange={() => setMode('auto')} 
                  style={{ marginRight: 8 }} 
                />
                מלא באופן אוטומטי
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                <input 
                  type="radio" 
                  name="upload-mode" 
                  value="manual" 
                  checked={mode === 'manual'} 
                  onChange={() => setMode('manual')} 
                  style={{ marginRight: 8 }} 
                />
                העלאה ללא שינוי
              </label>
            </div>
          </div>
          <DialogActions style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="text" onClick={onClose}>ביטול</Button>
            <Button 
              variant="contained" 
              onClick={() => onConfirm(mode)}
              style={{ 
                backgroundColor: '#0071e3',
                borderRadius: '8px',
                padding: '8px 16px'
              }}
            >
              המשך
            </Button>
          </DialogActions>
        </div>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default FileArea;
